const express = require("express");
const router = express.Router();

const {
  findNearbyHospitals,
} = require("../controllers/mapController");

router.get("/nearby-hospitals", findNearbyHospitals);

module.exports = router;
