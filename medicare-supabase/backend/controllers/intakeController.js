const getDB = require("../config/db");

// Save symptom intake
exports.addIntake = async (req, res) => {
  try {
    const { patientName, age, gender, symptoms, duration, severity, medicalHistory } = req.body;

    if (!patientName || !symptoms) {
      return res.status(400).json({ message: "patientName and symptoms are required." });
    }

    const db = getDB();
    const { data: intake, error } = await db
      .from("intakes")
      .insert({
        patient_name:    patientName.trim(),
        age:             age    || null,
        gender:          gender || "",
        symptoms:        symptoms.trim(),
        duration:        duration       || null,
        severity:        severity       || null,
        medical_history: medicalHistory || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Symptom intake saved successfully", intake });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all intakes (newest first, only needed fields)
exports.getAllIntakes = async (req, res) => {
  try {
    const db = getDB();
    const { data: intakes, error } = await db
      .from("intakes")
      .select("id, patient_name, age, gender, symptoms, duration, severity, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(intakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
