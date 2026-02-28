const express = require("express");
const c = require("../controllers/authController");

const router = express.Router();

router.post("/register", c.register);
router.post("/login", c.login);
router.post("/logout", c.logout);

module.exports = router;
