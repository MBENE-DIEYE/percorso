import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "@/lib/db"

export async function POST(req) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email e password sono obbligatorie" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "La password deve avere almeno 6 caratteri" }, { status: 400 })
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Esiste già un account con questa email" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" })

    return NextResponse.json({ token, user: { id: user.id, email: user.email } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore del server durante la registrazione" }, { status: 500 })
  }
}
