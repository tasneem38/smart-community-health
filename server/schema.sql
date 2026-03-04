CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  village TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symptom_reports (
  id SERIAL PRIMARY KEY,
  village TEXT,
  name TEXT,
  symptoms TEXT[], -- Array of strings
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB
);

CREATE TABLE IF NOT EXISTS water_tests (
  id SERIAL PRIMARY KEY,
  village TEXT,
  ph NUMERIC,
  turbidity NUMERIC,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  type TEXT,
  description TEXT,
  risk TEXT,
  village TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS assistance_requests (
  id SERIAL PRIMARY KEY,
  village TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB
);

CREATE TABLE IF NOT EXISTS ai_records (
  id SERIAL PRIMARY KEY,
  type TEXT,
  content TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followups (
  id SERIAL PRIMARY KEY,
  patient_name TEXT,
  task TEXT,
  status TEXT DEFAULT 'pending',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sarvam_chats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DPDP Compliance Tables
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  resource_id TEXT,
  resource_type TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  purpose TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
