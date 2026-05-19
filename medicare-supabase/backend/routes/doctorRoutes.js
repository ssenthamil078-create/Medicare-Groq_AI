const express = require("express");
const router = express.Router();

const {
  addDoctor,
  getDoctors,
  findEmergencyDoctors,
} = require("../controllers/doctorController");

router.post("/add", addDoctor);
router.get("/all", getDoctors);
router.get("/emergency", findEmergencyDoctors);

module.exports = router;