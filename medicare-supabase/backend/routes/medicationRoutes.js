const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  addMedication,
  getAllMedications,
  markMedicationTaken,
  checkMissedMedications,
  sendMedicationReminder,
  sendWhatsAppReminder,
  triggerDueReminders,
} = require("../controllers/medicationController");

router.post("/add", protect, addMedication);
router.get("/all", protect, getAllMedications);
router.put("/take/:id", protect, markMedicationTaken);
router.get("/missed", protect, checkMissedMedications);
router.post("/send-reminder/:id", sendMedicationReminder);
router.post("/send-whatsapp-reminder/:id", protect, sendWhatsAppReminder);
router.get("/trigger-reminders", triggerDueReminders);

module.exports = router;