const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const askGroq = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are MediCare AI, a safe healthcare support assistant. Do not give final diagnosis. Give simple guidance and recommend doctor consultation for serious symptoms.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_tokens: 700,
  });

  const text = completion.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned an empty response");
  }

  return text;
};

exports.healthCheckAI = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Groq is not configured",
      });
    }

    const result = await askGroq("Reply only: Groq AI is working.");

    res.status(200).json({
      success: true,
      message: "Groq AI is reachable",
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      result,
    });
  } catch (error) {
    console.error("Groq health check error:", error);

    res.status(503).json({
      success: false,
      message: "Groq health check failed",
      error: error.message,
    });
  }
};

exports.generateDiagnosis = async (req, res) => {
  try {
    const {
      patientName,
      age,
      gender,
      symptoms,
      duration,
      severity,
      medicalHistory,
    } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required",
      });
    }

    const prompt = `
Patient details:
Name: ${patientName || "Not provided"}
Age: ${age || "Not provided"}
Gender: ${gender || "Not provided"}
Symptoms: ${symptoms}
Duration: ${duration || "Not provided"}
Severity: ${severity || "Not provided"}
Medical History: ${medicalHistory || "Not provided"}

Generate a patient-friendly AI health support report with:
1. Possible condition summary
2. Risk level: Low / Medium / High
3. Basic care suggestions
4. Warning signs to watch for
5. Doctor consultation recommendation

Important:
- Do not provide a final diagnosis.
- Do not prescribe medicines.
- Keep it simple and safe.
`;

    const aiSummary = await askGroq(prompt);

    res.status(200).json({
      success: true,
      message: "AI diagnosis generated successfully",
      aiSummary,
    });
  } catch (error) {
    console.error("AI diagnosis error:", error);

    res.status(500).json({
      success: false,
      message: "AI diagnosis failed",
      error: error.message,
    });
  }
};

exports.checkDrugInteraction = async (req, res) => {
  try {
    const { medicines, age, medicalHistory } = req.body;

    if (!medicines) {
      return res.status(400).json({
        success: false,
        message: "Medicines are required",
      });
    }

    const prompt = `
Medicines: ${medicines}
Age: ${age || "Not provided"}
Medical History: ${medicalHistory || "Not provided"}

Generate a simple drug interaction support report with:
1. Possible interaction risks
2. Side effect warnings
3. Safety suggestions
4. Doctor/pharmacist consultation recommendation

Important:
- Do not make final medical decisions.
- Do not overstate risks.
- Keep it suitable for patient support.
`;

    const interactionSummary = await askGroq(prompt);

    res.status(200).json({
      success: true,
      message: "Drug interaction analysis generated successfully",
      interactionSummary,
    });
  } catch (error) {
    console.error("Drug interaction error:", error);

    res.status(500).json({
      success: false,
      message: "Drug interaction check failed",
      error: error.message,
    });
  }
};