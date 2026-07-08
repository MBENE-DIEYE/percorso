import jwt from "jsonwebtoken"

export const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload.userId
  } catch {
    return null
  }
}
