import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al primo caricamento, recupera il login salvato in precedenza (se c'è)
  useEffect(() => {
    const savedToken = localStorage.getItem("percorso_token")
    const savedUser = localStorage.getItem("percorso_user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("percorso_token", data.token)
    localStorage.setItem("percorso_user", JSON.stringify(data.user))
  }

  const register = async (email, password) => {
    const data = await api.register(email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("percorso_token", data.token)
    localStorage.setItem("percorso_user", JSON.stringify(data.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("percorso_token")
    localStorage.removeItem("percorso_user")
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
