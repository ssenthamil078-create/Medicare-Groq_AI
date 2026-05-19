const axios = require("axios");

// Parse prescription text using Ollama
const askOllama = async (prompt) => {
  const ollamaUrl   = process.env.OLLAMA_URL   || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:1b";

  const response = await axios.post(
    `${ollamaUrl}/api/generate`,
    { model: ollamaModel, prompt, stream: false },
    { timeout: 120000 }
  );

  return response.data?.response || "";
};

exports.scanPrescription = async (req, res) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({
        message: "extractedText is required. Send the OCR text from the client.",
      });
    }

    const prompt = `You are a medicine extraction parser.

Task: Extract only real medicine names, dosage, frequency, duration, and instructions from the following OCR text.

Rules:
- Ignore patient names, hospital names, doctor names, dates, signatures, and OCR noise.
- Do not guess medicine names.
- If any field is unclear use "Not clear".
- Return ONLY a valid JSON array. No markdown, no backticks, no extra text.

OCR TEXT:
${extractedText}

JSON format:
[{"medicineName":"...","dosage":"...","frequency":"...","duration":"...","instructions":"..."}]`;

    const aiResponse = await askOllama(prompt);
    const clean = aiResponse.replace(/```json|```/g, "").trim();

    let parsedMedicines;
    try {
      parsedMedicines = JSON.parse(clean);
    } catch {
      parsedMedicines = clean;
    }

    res.status(200).json({
      message: "Prescription scanned successfully",
      extractedText,
      aiParsedMedicines: parsedMedicines,
    });
  } catch (error) {
    res.status(500).json({ message: "Prescription scan failed", error: error.message });
  }
};
