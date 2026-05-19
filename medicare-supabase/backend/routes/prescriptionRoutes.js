const express = require("express");
const router = express.Router();
const { scanPrescription } = require("../controllers/prescriptionController");

// POST /api/prescription/scan
// Body: { extractedText: "..." }
// The frontend does OCR client-side (or sends raw text) and this route parses it with Gemini.
router.post("/scan", scanPrescription);

module.exports = router;
