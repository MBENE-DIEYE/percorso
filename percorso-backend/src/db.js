import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on("error", (err) => {
  console.error("Errore imprevisto sul pool Postgres:", err)
})
