import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/auth"

export async function DELETE(req, { params }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  const { id } = await params

  try {
    const result = await pool.query(
      "DELETE FROM percorsi WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Percorso non trovato" }, { status: 404 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nell'eliminazione del percorso" }, { status: 500 })
  }
}
