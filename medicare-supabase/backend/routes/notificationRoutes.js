const express = require("express");
const router = express.Router();

const {
  sendWhatsAppReminder,
  sendSOSAlert,
} = require("../controllers/notificationController");

router.post("/whatsapp-reminder", sendWhatsAppReminder);
router.post("/sos-alert", sendSOSAlert);
module.exports = router;