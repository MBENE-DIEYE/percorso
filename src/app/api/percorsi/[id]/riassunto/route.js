import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { pool } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/auth"
import { checkPercorsoOwnership } from "@/lib/percorsi"

const anthropic = new Anthropic()

export async function POST(req, { params }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Token mancante o non valido" }, { status: 401 })
  }

  const { id: percorsoId } = await params
  const { from, to } = (await req.json().catch(() => null)) || {}

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

    const noteResult = await pool.query(
      `SELECT contenuto, data FROM note WHERE ${conditions.join(" AND ")} ORDER BY data ASC`,
      queryParams
    )

    if (noteResult.rows.length === 0) {
      return NextResponse.json({ error: "Non ci sono note in questo periodo" }, { status: 400 })
    }

    const noteTestuali = noteResult.rows
      .map(n => `- ${n.data.toISOString().split("T")[0]}: ${n.contenuto}`)
      .join("\n")

    const descrizionePeriodo = from && to
      ? `dal ${from} al ${to}`
      : "durante l'intero percorso"

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Ecco un elenco di note giornaliere prese da una persona ${descrizionePeriodo}. Trasformale in un riassunto scorrevole, in italiano, in prosa (non elenco puntato), che racconti in modo naturale cosa è successo in questo periodo. Massimo 200 parole.\n\nNote:\n${noteTestuali}`,
        },
      ],
    })

    const riassunto = response.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n")

    return NextResponse.json({ riassunto })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nella generazione del riassunto" }, { status: 500 })
  }
}
