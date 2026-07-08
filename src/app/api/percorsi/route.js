import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/auth"

export async function GET(req) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  try {
    const result = await pool.query(
      "SELECT id, nome, created_at FROM percorsi WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nel recupero dei percorsi" }, { status: 500 })
  }
}

export async function POST(req) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  const { nome } = await req.json()
  if (!nome || !nome.trim()) {
    return NextResponse.json({ error: "Il nome del percorso è obbligatorio" }, { status: 400 })
  }

  try {
    const result = await pool.query(
      "INSERT INTO percorsi (user_id, nome) VALUES ($1, $2) RETURNING id, nome, created_at",
      [userId, nome.trim()]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nella creazione del percorso" }, { status: 500 })
  }
}
