const getDB = require("../config/db");
const { sendEmail } = require("../utils/emailService");

// Add medication
exports.addMedication = async (req, res) => {
  try {
    const {
      patientName,
      medicineName,
      dosage,
      frequency,
      reminderTime,
      startDate,
      endDate,
      notes,
      patientEmail,
      patientPhone,
      caregiverPhone,
      caregiverContact,
      reminderDate,
    } = req.body;

    if (!patientName || !medicineName || !dosage || !frequency || !reminderTime) {
      return res.status(400).json({
        message:
          "patientName, medicineName, dosage, frequency and reminderTime are required.",
      });
    }

    const db = getDB();

    const { data: medication, error } = await db
      .from("medications")
      .insert({
        patient_name: patientName.trim(),
        medicine_name: medicineName.trim(),
        dosage: dosage.trim(),
        frequency,
        reminder_time: reminderTime,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes || null,
        patient_email: patientEmail?.toLowerCase().trim() || null,
        patient_phone: patientPhone?.trim() || null,
        caregiver_phone: caregiverPhone?.trim() || null,
        caregiver_contact: caregiverContact?.trim() || null,
        reminder_date: reminderDate || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Medication added successfully",
      medication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all medications
exports.getAllMedications = async (req, res) => {
  try {
    const db = getDB();

    const { data: medications, error } = await db
      .from("medications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark medication as taken
exports.markMedicationTaken = async (req, res) => {
  try {
    const db = getDB();

    const { data: medication, error } = await db
      .from("medications")
      .update({
        taken_today: true,
        last_taken_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (!medication) {
      return res.status(404).json({ message: "Medication not found." });
    }

    res.status(200).json({
      message: "Medication marked as taken",
      medication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check missed medications
exports.checkMissedMedications = async (req, res) => {
  try {
    const db = getDB();

    const { data: missed, error } = await db
      .from("medications")
      .select("*")
      .eq("status", "Active")
      .eq("taken_today", false);

    if (error) throw error;

    res.status(200).json({
      message: "Missed medication check completed",
      missed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send email reminder
exports.sendMedicationReminder = async (req, res) => {
  try {
    const db = getDB();

    const { data: medication, error } = await db
      .from("medications")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !medication) {
      return res.status(404).json({ message: "Medication not found." });
    }

    if (!medication.patient_email) {
      return res.status(400).json({
        message: "Patient email not set for this medication.",
      });
    }

    const message = `Hello ${medication.patient_name},

This is your MediCare reminder.

Medicine: ${medication.medicine_name}
Dosage: ${medication.dosage}
Time: ${medication.reminder_time}

Please take your medicine on time.

- MediCare`;

    await sendEmail(
      medication.patient_email,
      "MediCare Medication Reminder",
      message
    );

    await db
      .from("medications")
      .update({ reminder_sent: true })
      .eq("id", req.params.id);

    res.status(200).json({
      message: "Medication reminder email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reminder email",
      error: error.message,
    });
  }
};

// Send WhatsApp reminder
exports.sendWhatsAppReminder = async (req, res) => {
  try {
    const { sendWhatsApp } = require("../utils/whatsappService");
    const db = getDB();

    const { data: medication, error } = await db
      .from("medications")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !medication) {
      return res.status(404).json({ message: "Medication not found." });
    }

    if (!medication.patient_phone) {
      return res.status(400).json({
        message: "Patient WhatsApp number not set for this medication.",
      });
    }

    await sendWhatsApp(
      medication.patient_phone,
      `🏥 *MediCare Reminder*

Hello ${medication.patient_name},

⏰ Time to take your medicine!

💊 *Medicine:* ${medication.medicine_name}
📏 *Dosage:* ${medication.dosage}
🕐 *Time:* ${medication.reminder_time}
📅 *Date:* ${medication.reminder_date || "Today"}

Please take it on time. Stay healthy! 💙

_- MediCare Emergency Network_`
    );

    await db
      .from("medications")
      .update({ whatsapp_reminder_sent: true })
      .eq("id", req.params.id);

    res.status(200).json({
      message: "WhatsApp reminder sent successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send WhatsApp reminder: " + error.message,
    });
  }
};

// Trigger all due reminders
exports.triggerDueReminders = async (req, res) => {
  try {
    const { sendWhatsApp } = require("../utils/whatsappService");
    const db = getDB();

    const today = new Date().toLocaleDateString("en-CA");
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const { data: medications, error } = await db
      .from("medications")
      .select("*")
      .eq("status", "Active")
      .eq("reminder_date", today)
      .eq("taken_today", false)
      .eq("whatsapp_reminder_sent", false);

    if (error) throw error;

    let sent = 0;

    for (const med of medications || []) {
      if (!med.patient_phone) continue;
      if (med.reminder_time > hhmm) continue;

      await sendWhatsApp(
        med.patient_phone,
        `🏥 *MediCare Reminder*

Hello ${med.patient_name},

⏰ Time to take your medicine!

💊 *Medicine:* ${med.medicine_name}
📏 *Dosage:* ${med.dosage}
🕐 *Time:* ${med.reminder_time}

Please take it on time. Stay healthy! 💙

_- MediCare Emergency Network_`
      );

      await db
        .from("medications")
        .update({ whatsapp_reminder_sent: true })
        .eq("id", med.id);

      sent++;

      if (med.caregiver_phone && !med.caregiver_alert_sent) {
        const [rh, rm] = med.reminder_time.split(":").map(Number);
        const reminderMinutes = rh * 60 + rm;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        if (nowMinutes - reminderMinutes >= 30) {
          await sendWhatsApp(
            med.caregiver_phone,
            `⚠️ *MediCare Caregiver Alert*

Patient *${med.patient_name}* has NOT taken medicine.

💊 *Medicine:* ${med.medicine_name}
📏 *Dosage:* ${med.dosage}
🕐 *Scheduled:* ${med.reminder_time}

Please check immediately.

_- MediCare Emergency Network_`
          );

          await db
            .from("medications")
            .update({ caregiver_alert_sent: true })
            .eq("id", med.id);
        }
      }
    }

    res.status(200).json({
      message: `Reminders processed. Sent: ${sent}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};