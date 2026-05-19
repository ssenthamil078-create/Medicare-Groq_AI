const cron  = require("node-cron");
const getDB = require("../config/db");
const { sendWhatsApp } = require("../utils/whatsappService");

const getTodayDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

const reminderToDate = (reminderTime) => {
  const [time, modifier] = reminderTime.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

exports.startReminderScheduler = () => {
  // Every minute — send reminder to patient
  cron.schedule("* * * * *", async () => {
    try {
      const db    = getDB();
      const today = getTodayDate();
      const now   = new Date();

      const { data: medications } = await db
        .from("medications")
        .select("*")
        .eq("status", "Active")
        .eq("reminder_date", today)
        .eq("taken_today", false)
        .eq("whatsapp_reminder_sent", false);

      for (const med of medications || []) {
        if (!med.patient_phone) continue;
        if (now < reminderToDate(med.reminder_time)) continue;

        await sendWhatsApp(
          med.patient_phone,
          `MediCare Reminder\n\nHello ${med.patient_name},\n\nTime to take your medicine.\n\nMedicine: ${med.medicine_name}\nDosage: ${med.dosage}\nTime: ${med.reminder_time}\n\nPlease take it on time.`
        );

        await db.from("medications").update({ whatsapp_reminder_sent: true }).eq("id", med.id);
        console.log("Reminder sent to:", med.patient_phone);
      }
    } catch (err) {
      console.log("Reminder scheduler error:", err.message);
    }
  });

  // Every minute — alert caregiver if not taken after 1 min
  cron.schedule("* * * * *", async () => {
    try {
      const db  = getDB();
      const now = new Date();

      const { data: medications } = await db
        .from("medications")
        .select("*")
        .eq("status", "Active")
        .eq("taken_today", false)
        .eq("whatsapp_reminder_sent", true)
        .eq("caregiver_alert_sent", false);

      for (const med of medications || []) {
        if (!med.caregiver_phone) continue;
        const diff = (now - reminderToDate(med.reminder_time)) / 60000;
        if (diff < 1) continue;

        await sendWhatsApp(
          med.caregiver_phone,
          `MediCare Caregiver Alert\n\nPatient ${med.patient_name} has NOT taken medicine.\n\nMedicine: ${med.medicine_name}\nDosage: ${med.dosage}\nScheduled: ${med.reminder_time}\n\nPlease check immediately.`
        );

        await db.from("medications").update({ caregiver_alert_sent: true }).eq("id", med.id);
        console.log("Caregiver alert sent:", med.caregiver_phone);
      }
    } catch (err) {
      console.log("Caregiver scheduler error:", err.message);
    }
  });
};
