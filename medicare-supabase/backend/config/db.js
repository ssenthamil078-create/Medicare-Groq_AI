const { createClient } = require("@supabase/supabase-js");

let client = null;

const getDB = () => {
  if (client) return client;

  const url  = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_KEY;   // service_role key (server-side only)

  if (!url || !key) {
    throw new Error(
      "❌ SUPABASE_URL or SUPABASE_SERVICE_KEY is missing. " +
      "Add both in Vercel → Project → Settings → Environment Variables."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },   // stateless — correct for serverless
  });

  console.log("✅ Supabase client initialised");
  return client;
};

module.exports = getDB;
