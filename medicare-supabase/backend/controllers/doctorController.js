const getDB = require("../config/db");

// Add doctor
exports.addDoctor = async (req, res) => {
  try {
    const { name, specialization, hospitalName, location, phone, available } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({ message: "Name and specialization are required." });
    }

    const db = getDB();
    const { data: doctor, error } = await db
      .from("doctors")
      .insert({
        name:           name.trim(),
        specialization: specialization.trim(),
        hospital_name:  hospitalName?.trim() || null,
        location:       location?.trim()     || null,
        phone:          phone?.trim()        || null,
        available:      available !== undefined ? available : true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const db = getDB();
    const { data: doctors, error } = await db
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find emergency doctors by location / specialization
exports.findEmergencyDoctors = async (req, res) => {
  try {
    const location       = (req.query.location       || "").trim().toLowerCase();
    const specialization = (req.query.specialization || req.query.specialist || "").trim().toLowerCase();

    const db = getDB();

    // Supabase ilike for case-insensitive partial match
    let query = db.from("doctors").select("*").eq("available", true);

    if (location) {
      query = query.or(`location.ilike.%${location}%,hospital_name.ilike.%${location}%`);
    }

    if (specialization) {
      query = query.ilike("specialization", `%${specialization}%`);
    }

    const { data: doctors, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      message: doctors.length
        ? "Emergency doctors fetched successfully"
        : "No doctors found for this location/specialization",
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
