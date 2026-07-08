import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/auth"
import { checkPercorsoOwnership } from "@/lib/percorsi"

export async function DELETE(req, { params }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  const { id: percorsoId, noteId } = await params

  const owns = await checkPercorsoOwnership(percorsoId, userId)
  if (!owns) return NextResponse.json({ error: "Percorso non trovato" }, { status: 404 })

  try {
    const result = await pool.query(
      "DELETE FROM note WHERE id = $1 AND percorso_id = $2 RETURNING id",
      [noteId, percorsoId]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Nota non trovata" }, { status: 404 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nell'eliminazione della nota" }, { status: 500 })
  }
}
