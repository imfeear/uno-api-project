require("dotenv").config();
const http = require("http");
const { initDb } = require("./models");
const app = require("./app");
const { initSocketServer } = require("./realtime/socketServer");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initDb();

    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
      console.log(`Swagger on http://localhost:${PORT}/unoAPI`);
      console.log(`Realtime UI on http://localhost:${PORT}/realtime.html`);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
})();