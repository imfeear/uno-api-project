const express = require("express");
const c = require("../controllers/userController");

const router = express.Router();

// We support both GET (Authorization header) and POST (body).
router.get("/profile", c.profile);
router.post("/profile", c.profile);

module.exports = router;
