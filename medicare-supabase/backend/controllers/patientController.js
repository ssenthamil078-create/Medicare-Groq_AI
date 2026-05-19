const getDB    = require("../config/db");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

// Register Patient
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender, emergencyContact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const db = getDB();

    // Check duplicate
    const { data: existing } = await db
      .from("patients")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: patient, error } = await db
      .from("patients")
      .insert({
        name:              name.trim(),
        email:             email.toLowerCase().trim(),
        password:          hashedPassword,
        age:               age || null,
        gender:            gender || "",
        emergency_contact: emergencyContact?.trim() || null,
      })
      .select("id, name, email, age, gender, emergency_contact, created_at")
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Patient registered successfully", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Patient
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const db = getDB();

    const { data: patient, error } = await db
      .from("patients")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;
    if (!patient) return res.status(404).json({ message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    const token = jwt.sign(
      { id: patient.id },
      process.env.JWT_SECRET || "medicare_secret_key",
      { expiresIn: "7d" }
    );

    // Never send password back
    const { password: _pw, ...patientData } = patient;

    res.status(200).json({ message: "Login successful", token, patient: patientData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
