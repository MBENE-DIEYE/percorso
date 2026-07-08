# Percorso (Next.js)

Diario di internship con riassunto AI — versione Next.js (App Router) di Percorso, che unifica in un solo progetto quello che prima erano `percorso-backend` (Express) e `percorso-frontend` (Vite).

## Struttura

- `src/app/` — pagine (`/login`, `/`, `/percorso/[id]`) e API routes (`src/app/api/...`)
- `src/lib/` — `db.js` (pool Postgres), `auth.js` (verifica JWT), `api.js` (client fetch usato dal frontend), `percorsi.js` (helper condiviso)
- `src/context/AuthContext.jsx` — stato di autenticazione (token in `localStorage`, come nella versione originale)
- `schema.sql` — schema del database, invariato rispetto alla versione Express

## Setup locale

1. `npm install`
2. Copia `.env.local.example` in `.env.local` e compila:
   - `DATABASE_URL` — connection string Postgres
   - `JWT_SECRET` — stringa lunga e casuale
   - `ANTHROPIC_API_KEY` — chiave per il riassunto AI
3. Esegui `schema.sql` sul tuo database Postgres (una volta sola)
4. `npm run dev` → http://localhost:3000

## Deploy su Vercel

1. Push di questo repo su GitHub
2. Su [vercel.com](https://vercel.com), "Add New Project" → importa il repo (il progetto Next.js è alla radice, nessuna configurazione di Root Directory necessaria)
3. Aggiungi le stesse tre variabili d'ambiente (`DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`) in Project Settings → Environment Variables
4. Per il database in produzione: dal Vercel Marketplace aggiungi l'integrazione **Neon** (Postgres serverless, si integra nativamente e imposta `DATABASE_URL` in automatico) — oppure usa un Postgres che hai già, incollando la sua connection string
5. Deploy. Ogni push su GitHub farà da lì in poi un deploy automatico

## Nota

La rotta `/api/percorsi/[id]/riassunto` esisteva già nel backend originale ma non risultava collegata a nessun pulsante nel frontend — è stata migrata così com'è (nessuna nuova funzionalità aggiunta), solo aggiornata per usare l'SDK ufficiale `@anthropic-ai/sdk` e il modello `claude-sonnet-5`.
