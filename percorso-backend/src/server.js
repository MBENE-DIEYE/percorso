import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import percorsiRoutes from "./routes/percorsi.js"
import noteRoutes from "./routes/note.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/percorsi", percorsiRoutes)
// Le note sono annidate sotto /percorsi/:percorsoId/note, gestite dallo stesso router "note"
app.use("/api/percorsi", noteRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`)
})
