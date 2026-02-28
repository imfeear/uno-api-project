const express = require("express");
const c = require("../controllers/gameLobbyController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", auth, c.createGame);
router.post("/join", auth, c.joinGame);
router.post("/ready", auth, c.ready);
router.post("/start", auth, c.start);

module.exports = router;
