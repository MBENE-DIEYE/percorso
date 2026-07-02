import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const LoginPage = () => {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [modalita, setModalita] = useState("login") // "login" | "registrati"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostraPassword, setMostraPassword] = useState(false)
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
              <div className="relative">
                <input
                  type={mostraPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-ink/15 bg-paper focus:outline-none focus:ring-2 focus:ring-thread-light"
                />
                <button
                  type="button"
                  onClick={() => setMostraPassword(v => !v)}
                  aria-label={mostraPassword ? "Nascondi password" : "Mostra password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                >
                  {mostraPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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
