# Percorso

**Percorso** è una web application sviluppata per la gestione e la documentazione di un percorso di internship.

L'applicazione permette agli utenti di autenticarsi, consultare i propri percorsi e visualizzare le informazioni relative alle attività svolte durante l'esperienza. Il progetto è stato successivamente migrato a **Next.js**, unificando frontend e backend in un'unica applicazione.

## 🌐 Live Demo

https://percorso-woad.vercel.app/

### Demo Account

Per provare l'applicazione è possibile utilizzare l'account demo:

* **Email:** `demo@percorso.com`
* **Password:** `PercorsoDemo2026!`

## ✨ Funzionalità

* Registrazione e autenticazione degli utenti
* Login e gestione della sessione
* Autenticazione tramite JWT
* Gestione dei percorsi di internship
* Visualizzazione dei dettagli dei percorsi
* Gestione dei dati tramite database PostgreSQL
* API Routes integrate direttamente in Next.js
* Generazione di riassunti tramite intelligenza artificiale
* Interfaccia responsive
* Gestione degli errori e delle richieste API
* Deploy e pubblicazione su Vercel

## 🧠 Riassunto tramite AI

Il progetto include una funzionalità per la generazione automatica di riassunti tramite un servizio di intelligenza artificiale.

La funzionalità è integrata nelle API Routes di Next.js e utilizza l'SDK ufficiale di Anthropic.

## 🛠️ Tecnologie utilizzate

### Frontend

* React
* Next.js
* JavaScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Node.js
* JWT
* PostgreSQL

### AI & API

* Anthropic API

### Deployment

* Vercel

## 🏗️ Architettura

Il progetto utilizza **Next.js App Router** e riunisce frontend e backend all'interno dello stesso repository.

Le API vengono gestite attraverso le API Routes di Next.js, mentre i dati vengono salvati in un database PostgreSQL.

Questa struttura permette di avere un'applicazione full-stack organizzata in un unico progetto.

## 📁 Struttura del progetto

```text
percorso/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── login/
│   │   ├── percorso/
│   │   └── page.*
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   └── lib/
│       ├── api.js
│       ├── auth.js
│       ├── db.js
│       └── percorsi.js
│
├── public/
├── schema.sql
├── .env.local.example
├── package.json
└── README.md
```

## 🚀 Installazione locale

Clona il repository:

```bash
git clone https://github.com/MBENE-DIEYE/percorso.git
```

Entra nella directory del progetto:

```bash
cd percorso
```

Installa le dipendenze:

```bash
npm install
```

Crea il file `.env.local` partendo dal file di esempio:

```bash
cp .env.local.example .env.local
```

Configura le variabili d'ambiente:

```env
DATABASE_URL=
JWT_SECRET=
ANTHROPIC_API_KEY=
```

Configura il database PostgreSQL utilizzando lo schema presente nel file:

```text
schema.sql
```

Avvia l'applicazione in ambiente di sviluppo:

```bash
npm run dev
```

L'applicazione sarà disponibile su:

```text
http://localhost:3000
```

## ☁️ Deploy

Il progetto è stato pubblicato utilizzando **Vercel**.

Per il deploy è necessario configurare le variabili d'ambiente del progetto:

```text
DATABASE_URL
JWT_SECRET
ANTHROPIC_API_KEY
```

Una volta configurato il progetto, ogni nuovo push sul repository può attivare automaticamente un nuovo deployment.

## 🎯 Obiettivi del progetto

Il progetto è stato sviluppato con l'obiettivo di approfondire:

* sviluppo di applicazioni full-stack
* utilizzo di Next.js e App Router
* gestione dell'autenticazione
* progettazione e utilizzo di API
* interazione con database PostgreSQL
* gestione delle variabili d'ambiente
* integrazione di servizi esterni e API AI
* deploy di applicazioni web su Vercel

## 👩‍💻 Autore

**MBENE DIEYE**

Web Developer

GitHub:
https://github.com/MBENE-DIEYE
