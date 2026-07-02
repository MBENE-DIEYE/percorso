import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const LoginPage = () => {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [modalita, setModalita] = useState("login") // "login" | "registrati"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errore, setErrore] = useState("")
  const [caricando, setCaricando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrore("")
    setCaricando(true)
    try {
      if (modalita === "login") {
        await login(email, password)
      } else {
        await register(email, password)
      }
      navigate("/")
    } catch (err) {
      setErrore(err.message)
    } finally {
      setCaricando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-ink">Percorso</h1>
          <p className="text-ink-soft text-sm mt-2">Il filo che tiene insieme i tuoi giorni</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex gap-1 mb-6 bg-paper rounded-full p-1">
            <button
              onClick={() => setModalita("login")}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                modalita === "login" ? "bg-thread text-white" : "text-ink-soft"
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => setModalita("registrati")}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                modalita === "registrati" ? "bg-thread text-white" : "text-ink-soft"
              }`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-ink-soft mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-paper focus:outline-none focus:ring-2 focus:ring-thread-light"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft mb-1 block">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-paper focus:outline-none focus:ring-2 focus:ring-thread-light"
              />
            </div>

            {errore && <p className="text-sm text-red-600">{errore}</p>}

            <button
              type="submit"
              disabled={caricando}
              className="mt-2 py-2.5 rounded-xl bg-thread text-white font-medium hover:bg-thread/90 transition-colors disabled:opacity-50"
            >
              {caricando ? "Un momento…" : modalita === "login" ? "Accedi" : "Crea account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
