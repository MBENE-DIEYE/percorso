import { pool } from "@/lib/db"

export const checkPercorsoOwnership = async (percorsoId, userId) => {
  const result = await pool.query(
    "SELECT id FROM percorsi WHERE id = $1 AND user_id = $2",
    [percorsoId, userId]
  )
  return result.rows.length > 0
}
