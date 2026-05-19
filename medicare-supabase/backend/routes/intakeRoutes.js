const express = require("express");
const router = express.Router();

const {
  addIntake,
  getAllIntakes,
} = require("../controllers/intakeController");
const { protect } = require("../middleware/authMiddleware");
router.post("/add", addIntake);
router.get("/all", getAllIntakes);

module.exports = router;