import { Router } from "express"
import { pool } from "../db.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.use(requireAuth)

// Verifica che il percorso appartenga all'utente loggato, altrimenti nessuno può leggere/scrivere note altrui
const checkPercorsoOwnership = async (percorsoId, userId) => {
  const result = await pool.query(
    "SELECT id FROM percorsi WHERE id = $1 AND user_id = $2",
    [percorsoId, userId]
  )
  return result.rows.length > 0
}

// Elenca le note di un percorso, dalla più recente.
// Supporta il filtro opzionale per intervallo di date: ?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/:percorsoId/note", async (req, res) => {
  const { percorsoId } = req.params
  const { from, to } = req.query

  const owns = await checkPercorsoOwnership(percorsoId, req.userId)
  if (!owns) return res.status(404).json({ error: "Percorso non trovato" })

  try {
    const conditions = ["percorso_id = $1"]
    const params = [percorsoId]

    if (from) {
      params.push(from)
      conditions.push(`data >= $${params.length}`)
    }
    if (to) {
      params.push(to)
      conditions.push(`data <= $${params.length}`)
    }

    const result = await pool.query(
      `SELECT id, contenuto, data, created_at FROM note
       WHERE ${conditions.join(" AND ")}
       ORDER BY data DESC, created_at DESC`,
      params
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nel recupero delle note" })
  }
})

// Restituisce i raggruppamenti automatici delle note in settimane (lun-ven) e mesi,
// calcolati dalle date effettive delle note già inserite. Utile per mostrare
// nel frontend una lista tipo "Settimana 1 (16-20 giu)", "Giugno 2026", ecc.
router.get("/:percorsoId/periodi", async (req, res) => {
  const { percorsoId } = req.params

  const owns = await checkPercorsoOwnership(percorsoId, req.userId)
  if (!owns) return res.status(404).json({ error: "Percorso non trovato" })

  try {
    const result = await pool.query(
      "SELECT DISTINCT data FROM note WHERE percorso_id = $1 ORDER BY data ASC",
      [percorsoId]
    )

    const date = result.rows.map(r => new Date(r.data))

    // --- Raggruppamento per settimana (lunedì-venerdì) ---
    const settimaneMap = new Map()
    for (const d of date) {
      const giorno = d.getUTCDay() // 0=dom, 1=lun, ... 6=sab
      const offsetDaLunedi = giorno === 0 ? 6 : giorno - 1
      const lunedi = new Date(d)
      lunedi.setUTCDate(d.getUTCDate() - offsetDaLunedi)
      const chiave = lunedi.toISOString().split("T")[0]

      if (!settimaneMap.has(chiave)) {
        const venerdi = new Date(lunedi)
        venerdi.setUTCDate(lunedi.getUTCDate() + 4)
        settimaneMap.set(chiave, {
          tipo: "settimana",
          from: lunedi.toISOString().split("T")[0],
          to: venerdi.toISOString().split("T")[0],
        })
      }
    }

    // --- Raggruppamento per mese ---
    const mesiMap = new Map()
    for (const d of date) {
      const anno = d.getUTCFullYear()
      const mese = d.getUTCMonth() // 0-11
      const chiave = `${anno}-${String(mese + 1).padStart(2, "0")}`

      if (!mesiMap.has(chiave)) {
        const primoGiorno = new Date(Date.UTC(anno, mese, 1))
        const ultimoGiorno = new Date(Date.UTC(anno, mese + 1, 0))
        mesiMap.set(chiave, {
          tipo: "mese",
          from: primoGiorno.toISOString().split("T")[0],
          to: ultimoGiorno.toISOString().split("T")[0],
        })
      }
    }

    res.json({
      settimane: [...settimaneMap.values()].sort((a, b) => a.from.localeCompare(b.from)),
      mesi: [...mesiMap.values()].sort((a, b) => a.from.localeCompare(b.from)),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nel calcolo dei periodi" })
  }
})

// Aggiunge una nota al percorso
router.post("/:percorsoId/note", async (req, res) => {
  const { percorsoId } = req.params
  const { contenuto, data } = req.body

  if (!contenuto || !contenuto.trim()) {
    return res.status(400).json({ error: "Il contenuto della nota è obbligatorio" })
  }

  const owns = await checkPercorsoOwnership(percorsoId, req.userId)
  if (!owns) return res.status(404).json({ error: "Percorso non trovato" })

  try {
    const result = await pool.query(
      `INSERT INTO note (percorso_id, contenuto, data)
       VALUES ($1, $2, COALESCE($3, CURRENT_DATE))
       RETURNING id, contenuto, data, created_at`,
      [percorsoId, contenuto.trim(), data || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nell'aggiunta della nota" })
  }
})

// Elimina una nota
router.delete("/:percorsoId/note/:noteId", async (req, res) => {
  const { percorsoId, noteId } = req.params

  const owns = await checkPercorsoOwnership(percorsoId, req.userId)
  if (!owns) return res.status(404).json({ error: "Percorso non trovato" })

  try {
    const result = await pool.query(
      "DELETE FROM note WHERE id = $1 AND percorso_id = $2 RETURNING id",
      [noteId, percorsoId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nota non trovata" })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nell'eliminazione della nota" })
  }
})

// Genera un riassunto leggibile delle note del percorso usando l'API di Claude.
// Body opzionale: { from, to } per limitare il riassunto a una settimana o un mese specifico.
// Se from/to non vengono passati, il riassunto copre tutte le note del percorso.
router.post("/:percorsoId/riassunto", async (req, res) => {
  const { percorsoId } = req.params
  const { from, to } = req.body || {}

  const owns = await checkPercorsoOwnership(percorsoId, req.userId)
  if (!owns) return res.status(404).json({ error: "Percorso non trovato" })

  try {
    const conditions = ["percorso_id = $1"]
    const params = [percorsoId]

    if (from) {
      params.push(from)
      conditions.push(`data >= $${params.length}`)
    }
    if (to) {
      params.push(to)
      conditions.push(`data <= $${params.length}`)
    }

    const noteResult = await pool.query(
      `SELECT contenuto, data FROM note WHERE ${conditions.join(" AND ")} ORDER BY data ASC`,
      params
    )

    if (noteResult.rows.length === 0) {
      return res.status(400).json({ error: "Non ci sono note in questo periodo" })
    }

    const noteTestuali = noteResult.rows
      .map(n => `- ${n.data.toISOString().split("T")[0]}: ${n.contenuto}`)
      .join("\n")

    const descrizionePeriodo = from && to
      ? `dal ${from} al ${to}`
      : "durante l'intero percorso"

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Ecco un elenco di note giornaliere prese da una persona ${descrizionePeriodo}. Trasformale in un riassunto scorrevole, in italiano, in prosa (non elenco puntato), che racconti in modo naturale cosa è successo in questo periodo. Massimo 200 parole.\n\nNote:\n${noteTestuali}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("Errore API Claude:", errText)
      return res.status(502).json({ error: "Errore nella generazione del riassunto" })
    }

    const data = await response.json()
    const riassunto = data.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n")

    res.json({ riassunto })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nella generazione del riassunto" })
  }
})

export default router
