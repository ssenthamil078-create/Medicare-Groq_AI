const { sendWhatsApp } = require("../utils/whatsappService");

exports.sendWhatsAppReminder = async (req, res) => {
  try {
    const { phone, patientName, medicineName, dosage, reminderTime } = req.body;

    if (!phone || !medicineName) {
      return res.status(400).json({
        message: "Phone and medicine name are required",
      });
    }

    const message = `
MediCare Reminder

Hello ${patientName},

Please take your medicine.

Medicine: ${medicineName}
Dosage: ${dosage}
Time: ${reminderTime}

Stay healthy.
`;

    await sendWhatsApp(phone, message);

    res.status(200).json({
      message: "WhatsApp reminder sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send WhatsApp reminder",
      error: error.message,
    });
  }
};
exports.sendSOSAlert = async (req, res) => {
  try {
    const {
      patientName,
      caregiverPhone,
      latitude,
      longitude,
      emergencyMessage,
    } = req.body;

    if (!patientName || !caregiverPhone || !latitude || !longitude) {
      return res.status(400).json({
        message: "Patient name, caregiver phone, latitude and longitude are required",
      });
    }

    const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const message = `
🚨 MediCare Emergency SOS Alert

Patient: ${patientName}

Emergency Message:
${emergencyMessage || "Patient needs immediate help."}

Live Location:
${locationLink}

Please contact or reach the patient immediately.
`;

    await sendWhatsApp(caregiverPhone, message);

    res.status(200).json({
      message: "Emergency SOS WhatsApp alert sent successfully",
      locationLink,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send SOS alert",
      error: error.message,
    });
  }
};