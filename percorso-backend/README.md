# Percorso — Backend

Backend Node.js + Express + PostgreSQL per l'app di note giornaliere con riassunto AI.

## Setup

### 1. Installa PostgreSQL (se non ce l'hai già)

Su Windows, il modo più semplice è scaricare l'installer da https://www.postgresql.org/download/windows/
Durante l'installazione ti verrà chiesta una password per l'utente `postgres` — annotala.

### 2. Crea il database

Apri **pgAdmin** (installato insieme a Postgres) oppure il terminale `psql` e crea un database:

```sql
CREATE DATABASE percorso;
```

### 3. Applica lo schema

Da terminale (Git Bash), nella cartella del progetto:

```bash
psql -U postgres -d percorso -f schema.sql
```

Ti chiederà la password che hai impostato all'installazione.

### 4. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Poi apri `.env` e sistema:
- `DATABASE_URL` con la password vera che hai impostato
- `JWT_SECRET` con una stringa lunga a caso (puoi generarla con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ANTHROPIC_API_KEY` con la tua chiave API Claude (la trovi su console.anthropic.com)

### 5. Installa le dipendenze e avvia

```bash
npm install
npm run dev
```

Il server parte su `http://localhost:4000`. Prova ad aprirlo nel browser su `http://localhost:4000/api/health` — se vedi `{"status":"ok"}` è tutto a posto.

## Rotte disponibili

| Metodo | Rotta | Descrizione | Autenticazione |
|---|---|---|---|
| POST | /api/auth/register | Crea un account | No |
| POST | /api/auth/login | Login | No |
| GET | /api/percorsi | Lista dei tuoi percorsi | Sì (Bearer token) |
| POST | /api/percorsi | Crea un percorso | Sì |
| DELETE | /api/percorsi/:id | Elimina un percorso | Sì |
| GET | /api/percorsi/:id/note | Lista note del percorso (opzionale: `?from=YYYY-MM-DD&to=YYYY-MM-DD`) | Sì |
| POST | /api/percorsi/:id/note | Aggiungi una nota | Sì |
| DELETE | /api/percorsi/:id/note/:noteId | Elimina una nota | Sì |
| GET | /api/percorsi/:id/periodi | Restituisce le settimane (lun-ven) e i mesi calcolati dalle date delle note esistenti | Sì |
| POST | /api/percorsi/:id/riassunto | Genera riassunto AI. Body opzionale `{ from, to }` per limitare a un periodo, altrimenti copre tutto il percorso | Sì |

### Esempio: riassunto di una settimana specifica

```bash
curl -X POST http://localhost:4000/api/percorsi/1/riassunto \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"from": "2026-06-16", "to": "2026-06-20"}'
```

### Esempio: vedere come vengono raggruppate le tue note

```bash
curl http://localhost:4000/api/percorsi/1/periodi \
  -H "Authorization: Bearer <token>"
```

Risposta tipo:
```json
{
  "settimane": [{ "tipo": "settimana", "from": "2026-06-16", "to": "2026-06-20" }],
  "mesi": [{ "tipo": "mese", "from": "2026-06-01", "to": "2026-06-30" }]
}
```
Il frontend può usare questi `from`/`to` per popolare i pulsanti "Settimana 1", "Giugno 2026", ecc. e passarli direttamente alla rotta del riassunto.

Per le rotte protette, aggiungi l'header:
```
Authorization: Bearer <token ricevuto da login/register>
```


 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4Mjk5MDA2MiwiZXhwIjoxNzg1NTgyMDYyfQ.IHNiRO-qcqeitIBYTTLXfOOSjE12FBSsoKg056wgW4I",
    "user": {
        "id": 1,
        "email": "tuaemail@test.com"
    }