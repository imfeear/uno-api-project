// Clears memoize cache on write operations (POST/PUT/PATCH/DELETE).
// Use it BEFORE the memoize middleware.

function createCacheBuster(memoizeMiddleware) {
  const api = memoizeMiddleware && memoizeMiddleware.__memoize;

  return function cacheBuster(req, _res, next) {
    const method = String(req.method || "").toUpperCase();
    const isWrite = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

    if (isWrite && api && typeof api.clear === "function") {
      api.clear();
    }

    return next();
  };
}

module.exports = createCacheBuster;