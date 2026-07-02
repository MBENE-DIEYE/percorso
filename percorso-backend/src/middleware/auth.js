import jwt from "jsonwebtoken"

// Protegge le rotte: legge il token dall'header Authorization e verifica che sia valido.
// Se ok, mette req.userId a disposizione delle rotte successive.
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token mancante" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch (err) {
    return res.status(401).json({ error: "Token non valido o scaduto" })
  }
}
