# Percorso — Frontend

Frontend React (Vite + Tailwind) per l'app di note giornaliere con riassunto AI.
Si collega al backend `percorso-backend` che deve essere già avviato su `http://localhost:4000`.

## Setup

```bash
npm install
npm run dev
```

Si apre su `http://localhost:5173`.

**Importante**: assicurati che il backend sia avviato (`npm run dev` nella cartella `percorso-backend`) prima di aprire il frontend, altrimenti login e registrazione non funzioneranno.

## Struttura

```
src/
  api.js                    → tutte le chiamate al backend, in un unico posto
  context/AuthContext.jsx   → gestisce login/registrazione/logout e il token
  pages/
    LoginPage.jsx            → login + registrazione
    PercorsiPage.jsx         → elenco dei tuoi percorsi, crearne di nuovi
    PercorsoDetailPage.jsx   → note del percorso, filtri per settimana/mese, riassunto AI
```

## Come funziona il flusso

1. Ti registri o accedi (il token viene salvato in `localStorage`, resti loggata tra un refresh e l'altro)
2. Crei un percorso (es. "Stage Mia Academy")
3. Ogni giorno aggiungi una riga veloce nella pagina del percorso
4. Il backend calcola da solo le settimane e i mesi disponibili — appaiono come pulsanti filtro
5. Selezioni un periodo (o lasci "Tutto") e premi "Genera riassunto" — il testo arriva dall'API di Claude
