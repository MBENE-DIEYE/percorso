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

  const owns = await checkPercorsoOwnership(percorsoId, userId)
  if (!owns) return NextResponse.json({ error: "Percorso non trovato" }, { status: 404 })

  try {
    const result = await pool.query(
      "SELECT DISTINCT data FROM note WHERE percorso_id = $1 ORDER BY data ASC",
      [percorsoId]
    )

    const date = result.rows.map(r => new Date(r.data))

    const settimaneMap = new Map()
    for (const d of date) {
      const giorno = d.getUTCDay()
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

    const mesiMap = new Map()
    for (const d of date) {
      const anno = d.getUTCFullYear()
      const mese = d.getUTCMonth()
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

    return NextResponse.json({
      settimane: [...settimaneMap.values()].sort((a, b) => a.from.localeCompare(b.from)),
      mesi: [...mesiMap.values()].sort((a, b) => a.from.localeCompare(b.from)),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Errore nel calcolo dei periodi" }, { status: 500 })
  }
}
