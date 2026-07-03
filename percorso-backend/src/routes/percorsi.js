import { Router } from "express"
import { pool } from "../db.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.use(requireAuth)

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, created_at FROM percorsi WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nel recupero dei percorsi" })
  }
})

router.post("/", async (req, res) => {
  const { nome } = req.body
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: "Il nome del percorso è obbligatorio" })
  }

  try {
    const result = await pool.query(
      "INSERT INTO percorsi (user_id, nome) VALUES ($1, $2) RETURNING id, nome, created_at",
      [req.userId, nome.trim()]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nella creazione del percorso" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM percorsi WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Percorso non trovato" })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore nell'eliminazione del percorso" })
  }
})

export default router
