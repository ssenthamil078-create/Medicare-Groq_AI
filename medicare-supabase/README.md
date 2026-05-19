# MediCare – Supabase + Ollama Edition

React + Vite frontend · Express backend · Supabase (PostgreSQL) · Ollama AI

---

## Step 1 – Supabase Setup

1. Go to supabase.com → New Project → give it a name and password
2. Wait for project to provision (~1 min)
3. Go to SQL Editor → New Query → paste the entire contents of backend/config/schema.sql → Run
4. Go to Settings → API and copy:
   - Project URL  →  this is your SUPABASE_URL
   - service_role key (NOT anon key)  →  this is your SUPABASE_SERVICE_KEY

---

## Step 2 – Ollama Setup (for AI features)

Ollama runs on YOUR computer or a server. It does not run on Vercel.

Local development:
  1. Download from ollama.com
  2. Run: ollama serve
  3. Run: ollama pull llama3.2:1b
  4. Set OLLAMA_URL=http://localhost:11434 in your backend .env

For production (Vercel):
  Option A: Run Ollama on a VPS (DigitalOcean/Railway) and expose it publicly
            Then set OLLAMA_URL=https://your-vps-ip:11434 in Vercel env vars
  Option B: Run Ollama locally and expose via ngrok:
            ngrok http 11434
            Then set OLLAMA_URL=https://xxxx.ngrok.io in Vercel env vars

---

## Step 3 – Push to GitHub

  cd medicare-supabase
  mv gitignore.txt .gitignore
  git init
  git add .
  git commit -m "Initial commit – MediCare Supabase"
  git remote add origin https://github.com/YOUR_USERNAME/medicare.git
  git branch -M main
  git push -u origin main

---

## Step 4 – Deploy Backend on Vercel

1. vercel.com → New Project → Import your GitHub repo
2. Root Directory → set to: backend
3. Framework Preset: Other
4. Environment Variables – add all of these:

   SUPABASE_URL          = https://xxx.supabase.co
   SUPABASE_SERVICE_KEY  = eyJ...  (service_role key)
   JWT_SECRET            = any_long_random_string
   OLLAMA_URL            = https://your-public-ollama-host  (or skip if AI not needed in prod)
   OLLAMA_MODEL          = llama3.2:1b
   FRONTEND_URL          = (leave blank, fill after Step 5)

5. Deploy → copy the backend URL

---

## Step 5 – Deploy Frontend on Vercel

1. vercel.com → New Project → Import same GitHub repo
2. Root Directory → set to: frontend
3. Framework Preset: Vite
4. Environment Variables:

   VITE_API_BASE_URL = https://your-backend.vercel.app   ← must be set BEFORE deploying

5. Deploy → copy the frontend URL
6. Go back to backend project → Settings → Environment Variables → add:
   FRONTEND_URL = https://your-frontend.vercel.app → Redeploy

---

## Local Development

  # Backend
  cd backend
  cp env.example .env          (fill in values)
  npm install
  npm run dev                  (runs on localhost:5000)

  # Frontend – new terminal
  cd frontend
  cp env.example .env.local    (set VITE_API_BASE_URL=http://localhost:5000)
  npm install
  npm run dev                  (runs on localhost:5173)

  # Ollama – separate terminal
  ollama serve
  ollama pull llama3.2:1b

---

## What changed from MongoDB version

  MongoDB + Mongoose  →  Supabase (PostgreSQL)
  No more schema files  →  SQL schema in backend/config/schema.sql
  Gemini AI  →  Ollama (llama3.2:1b, runs locally or on your server)
  mongoose.connect  →  Supabase createClient (no connection pooling needed)
  Mongoose models  →  Plain Supabase query builder
