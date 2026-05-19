require("dotenv").config();
const twilio = require("twilio");

function normalizeWhatsAppNumber(number) {
  if (!number) throw new Error("Recipient WhatsApp number is required");
  let cleaned = String(number).trim().replace(/\s+/g, "");
  if (!cleaned.startsWith("+")) {
    cleaned = `+91${cleaned.replace(/^0+/, "")}`;
  }
  return `whatsapp:${cleaned}`;
}

exports.sendWhatsApp = async (to, message) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error("Missing Twilio env values: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM");
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const fromNumber = TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
    ? TWILIO_WHATSAPP_FROM.trim()
    : `whatsapp:${TWILIO_WHATSAPP_FROM.trim()}`;
  const toNumber = normalizeWhatsAppNumber(to);

  return client.messages.create({
    from: fromNumber,
    to: toNumber,
    body: message,
  });
};
