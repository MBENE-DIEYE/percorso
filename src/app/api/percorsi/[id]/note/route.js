import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/auth"
import { checkPercorsoOwnership } from "@/lib/percorsi"

export async function GET(req, { params }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  const { id: percorsoId } = await params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const owns = await checkPercorsoOwnership(percorsoId, userId)
  if (!owns) return NextResponse.json({ error: "Percorso non trovato" }, { status: 404 })

  try {
    const conditions = ["percorso_id = $1"]
    const queryParams = [percorsoId]

    if (from) {
      queryParams.push(from)
      conditions.push(`data >= $${queryParams.length}`)
    }
    if (to) {
      queryParams.push(to)
      conditions.push(`data <= $${queryParams.length}`)
    }

    const result = await pool.query(
      `SELECT id, contenuto, data, created_at FROM note
       WHERE ${conditions.join(" AND ")}
       ORDER BY data DESC, created_at DESC`,
      queryParams
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nel recupero delle note" }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  const { id: percorsoId } = await params
  const { contenuto, data } = await req.json()

  if (!contenuto || !contenuto.trim()) {
    return NextResponse.json({ error: "Il contenuto della nota è obbligatorio" }, { status: 400 })
  }

  const owns = await checkPercorsoOwnership(percorsoId, userId)
  if (!owns) return NextResponse.json({ error: "Percorso non trovato" }, { status: 404 })

  try {
    const result = await pool.query(
      `INSERT INTO note (percorso_id, contenuto, data)
       VALUES ($1, $2, COALESCE($3, CURRENT_DATE))
       RETURNING id, contenuto, data, created_at`,
      [percorsoId, contenuto.trim(), data || null]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nell'aggiunta della nota" }, { status: 500 })
  }
}
