const CACHE_MAX = Number(process.env.CACHE_MAX ?? 50);
const CACHE_MAX_AGE_MS = Number(process.env.CACHE_MAX_AGE_MS ?? 30000);

module.exports = {
  CACHE_MAX,
  CACHE_MAX_AGE_MS,
};