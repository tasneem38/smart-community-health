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
