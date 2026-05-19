const express = require("express");
const router = express.Router();

const {
  healthCheckAI,
  generateDiagnosis,
  checkDrugInteraction,
} = require("../controllers/aiController");

router.get("/health", healthCheckAI);
router.post("/diagnosis", generateDiagnosis);
router.post("/drug-interaction", checkDrugInteraction);

module.exports = router;
