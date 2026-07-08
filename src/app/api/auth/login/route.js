import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "@/lib/db"

export async function POST(req) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email e password sono obbligatorie" }, { status: 400 })
  }

  try {
    const result = await pool.query("SELECT id, email, password_hash FROM users WHERE email = $1", [email])
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash)
    if (!passwordOk) {
      return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" })
    return NextResponse.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore del server durante il login" }, { status: 500 })
  }
}
