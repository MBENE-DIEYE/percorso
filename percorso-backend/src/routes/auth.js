import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "../db.js"

const router = Router()

router.post("/register", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email e password sono obbligatorie" })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La password deve avere almeno 6 caratteri" })
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Esiste già un account con questa email" })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" })

    res.status(201).json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore del server durante la registrazione" })
  }
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email e password sono obbligatorie" })
  }

  try {
    const result = await pool.query("SELECT id, email, password_hash FROM users WHERE email = $1", [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" })
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash)
    if (!passwordOk) {
      return res.status(401).json({ error: "Credenziali non valide" })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" })
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Errore del server durante il login" })
  }
})

export default router
