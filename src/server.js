require("dotenv").config();
const { initDb } = require("./models");
const app = require("./app");

const PORT = process.env.PORT || 3000;

(async () => {
  await initDb();

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
})();
