const crypto = require("crypto");

// Memoization middleware with in-memory cache, LRU eviction, and sliding expiration (TTL resets on access).
// No external memoization libraries are used.

function nowMs() {
  return Date.now();
}

function normalizeHeaderName(name) {
  return String(name || "").trim().toLowerCase();
}

function defaultKeyBuilder(req, config) {
  const method = String(req.method || "").toUpperCase();
  const url = req.originalUrl || req.url || "";
  let key = `${method}:${url}`;

  if (config.varyByUser) {
    const auth = (req.headers && req.headers.authorization) || "";
    if (auth) key += `:a=${auth}`;
  }

  return key;
}

function isFresh(entry) {
  return entry && typeof entry.expiresAt === "number" && entry.expiresAt > nowMs();
}

function shouldCacheMethod(req, methods) {
  const m = String(req.method || "").toUpperCase();
  return Array.isArray(methods) ? methods.includes(m) : m === "GET";
}

function shouldBypass(req, config) {
  if (!shouldCacheMethod(req, config.methods)) return true;

  const url = req.originalUrl || req.url || "";

  if (Array.isArray(config.excludePaths)) {
    for (const p of config.excludePaths) {
      if (!p) continue;
      if (typeof p === "string" && url.startsWith(p)) return true;
      if (p instanceof RegExp && p.test(url)) return true;
    }
  }

  const cc = (req.headers && req.headers["cache-control"]) || "";
  if (typeof cc === "string" && /no-cache|no-store/i.test(cc)) return true;

  return false;
}

function shouldStoreResponse(res, config) {
  const status = res.statusCode || 200;
  if (status < 200 || status >= 300) return false;

  if (typeof config.shouldCacheResponse === "function") {
    return Boolean(config.shouldCacheResponse(res));
  }

  return true;
}

function pickHeadersToCache(res) {
  const headers = res.getHeaders ? res.getHeaders() : {};
  const out = {};

  for (const [k, v] of Object.entries(headers || {})) {
    const name = normalizeHeaderName(k);

    // Don't cache Set-Cookie (unsafe).
    if (name === "set-cookie") continue;

    // Cache safe defaults + custom X- headers.
    if (name === "content-type" || name === "etag" || name === "cache-control" || name.startsWith("x-")) {
      out[name] = v;
    }
  }

  return out;
}

function applyCached(res, entry, config) {
  if (entry.headers && typeof res.set === "function") {
    for (const [k, v] of Object.entries(entry.headers)) {
      try {
        res.set(k, v);
      } catch (_) {}
    }
  }

  res.set("X-Cache", "HIT");
  res.set("X-Cache-TTL", String(config.maxAge));

  res.status(entry.statusCode || 200);
  return res.send(entry.body);
}

function createMemoizeMiddleware(userConfig) {
  const config = {
    max: 50,
    maxAge: 30_000,
    methods: ["GET"],
    varyByUser: false,
    keyBuilder: null,
    excludePaths: ["/api/auth"],
    ...((userConfig && typeof userConfig === "object") ? userConfig : {}),
  };

  const store = new Map(); // key -> entry; Map order used as LRU (oldest first)

  function buildKey(req) {
    if (typeof config.keyBuilder === "function") return String(config.keyBuilder(req));
    return defaultKeyBuilder(req, config);
  }

  function touch(key, entry) {
    store.delete(key);
    entry.expiresAt = nowMs() + config.maxAge; // sliding expiration
    store.set(key, entry); // move to most-recent
  }

  function evictIfNeeded() {
    while (store.size > config.max) {
      const oldestKey = store.keys().next().value;
      if (oldestKey === undefined) break;
      store.delete(oldestKey);
    }
  }

  function clear() {
    store.clear();
  }

  function sweepExpired() {
    const t = nowMs();
    for (const [k, v] of store.entries()) {
      if (!v || typeof v.expiresAt !== "number" || v.expiresAt <= t) store.delete(k);
    }
  }

  const middleware = function memoize(req, res, next) {
    // evidências sempre
    res.set("X-Cache", "MISS");
    res.set("X-Cache-TTL", "0");

    try {
      if (shouldBypass(req, config)) return next();

      sweepExpired();

      const key = buildKey(req);
      const entry = store.get(key);

      // HIT
      if (entry && isFresh(entry)) {
        touch(key, entry);
        return applyCached(res, entry, config);
      }

      // MISS (remove expirado)
      if (entry) store.delete(key);

      // Captura o corpo real enviado (garante cache até para res.json)
      const originalWrite = res.write.bind(res);
      const originalEnd = res.end.bind(res);
      const chunks = [];

      res.write = function (chunk, encoding, cb) {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        }
        return originalWrite(chunk, encoding, cb);
      };

      res.end = function (chunk, encoding, cb) {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        }

        try {
          if (shouldStoreResponse(res, config)) {
            const bodyBuffer = Buffer.concat(chunks);
            const bodyToStore = bodyBuffer.toString("utf8");

            const saved = {
              statusCode: res.statusCode || 200,
              headers: pickHeadersToCache(res),
              body: bodyToStore,
              expiresAt: nowMs() + config.maxAge,
            };

            store.set(key, saved);
            evictIfNeeded();

            // TTL evidência em MISS também (igual ao print)
            res.set("X-Cache-TTL", String(config.maxAge));
          }
        } catch (_) {
          // não quebra a resposta se o cache falhar
        }

        return originalEnd(chunk, encoding, cb);
      };

      return next();
    } catch (e) {
      return next(e);
    }
  };

  // expose controls for cacheBuster / debug
  middleware.__memoize = {
    clear,
  };

  return middleware;
}

module.exports = createMemoizeMiddleware;