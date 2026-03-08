const express = require("express");
const path = require("path");
const crypto = require("crypto");
const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const memoize = require("./middlewares/memoize");
const cacheBuster = require("./middlewares/cacheBuster");
const { CACHE_MAX, CACHE_MAX_AGE_MS } = require("./config/cache");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/unoAPI", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get("/health", (req, res) => res.json({ status: "ok" }));

const memoizeMw = memoize({
  max: CACHE_MAX,
  maxAge: CACHE_MAX_AGE_MS,
  methods: ["GET"],
  varyByUser: false,
  keyBuilder: (req) => {
    const base = `${req.method}:${req.originalUrl}`;
    const auth = req.headers.authorization || "";
    if (!auth) return base;

    const h = crypto.createHash("sha1").update(auth).digest("hex").slice(0, 12);
    return `${base}:a=${h}`;
  },
});

app.use("/api", cacheBuster(memoizeMw));
app.use("/api", memoizeMw);

if (process.env.NODE_ENV !== "production") {
  let __cacheHits = 0;

  app.get("/api/__cache_test", (req, res) => {
    __cacheHits += 1;

    res.set("X-Handler-Count", String(__cacheHits));
    res.set("X-Custom", "ABC");
    res.set("Set-Cookie", "sid=123; Path=/; HttpOnly");

    res.json({
      n: __cacheHits,
      ts: Date.now(),
      key: req.originalUrl,
    });
  });

  app.post("/api/__cache_mutate", (_req, res) => {
    res.sendStatus(204);
  });
}

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;