const express = require("express");
const c = require("../controllers/cardController");

const router = express.Router();

router.post("/", c.create);
router.get("/", c.list);
router.get("/:id", c.getById);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
