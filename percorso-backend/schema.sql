-- Esegui questo file una volta sul tuo database Postgres per creare le tabelle

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS percorsi (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS note (
  id SERIAL PRIMARY KEY,
  percorso_id INTEGER NOT NULL REFERENCES percorsi(id) ON DELETE CASCADE,
  contenuto TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_percorsi_user ON percorsi(user_id);
CREATE INDEX IF NOT EXISTS idx_note_percorso ON note(percorso_id);
