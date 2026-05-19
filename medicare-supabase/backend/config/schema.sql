-- ============================================================
-- MediCare – Supabase SQL Schema
-- Run this ONCE in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  age         INTEGER CHECK (age >= 0 AND age <= 120),
  gender      TEXT CHECK (gender IN ('Male','Female','Other','')),
  emergency_contact TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name            TEXT NOT NULL,
  medicine_name           TEXT NOT NULL,
  dosage                  TEXT NOT NULL,
  frequency               TEXT NOT NULL,
  reminder_time           TEXT NOT NULL,
  start_date              TEXT,
  end_date                TEXT,
  notes                   TEXT,
  status                  TEXT DEFAULT 'Active' CHECK (status IN ('Active','Completed','Paused')),
  patient_email           TEXT,
  patient_phone           TEXT,
  caregiver_phone         TEXT,
  caregiver_contact       TEXT,
  taken_today             BOOLEAN DEFAULT FALSE,
  reminder_sent           BOOLEAN DEFAULT FALSE,
  whatsapp_reminder_sent  BOOLEAN DEFAULT FALSE,
  caregiver_alert_sent    BOOLEAN DEFAULT FALSE,
  last_taken_at           TEXT,
  reminder_date           TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  specialization  TEXT NOT NULL,
  hospital_name   TEXT,
  location        TEXT,
  phone           TEXT,
  available       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Symptom Intakes
CREATE TABLE IF NOT EXISTS intakes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name    TEXT NOT NULL,
  age             INTEGER CHECK (age >= 0 AND age <= 120),
  gender          TEXT,
  symptoms        TEXT NOT NULL,
  duration        TEXT,
  severity        TEXT,
  medical_history TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security but allow service_role full access
ALTER TABLE patients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes    ENABLE ROW LEVEL SECURITY;
