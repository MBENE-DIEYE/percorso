"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import RichiedeAuth from "@/components/RichiedeAuth"

const PercorsiPage = () => {
  const { token, user, logout } = useAuth()
  const router = useRouter()
  const [percorsi, setPercorsi] = useState([])
  const [caricando, setCaricando] = useState(true)
  const [nuovoNome, setNuovoNome] = useState("")
  const [errore, setErrore] = useState("")

  const carica = async () => {
    setCaricando(true)
    try {
      const data = await api.getPercorsi(token)
      setPercorsi(data)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setCaricando(false)
    }
  }

  useEffect(() => {
    if (token) carica()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleCrea = async (e) => {
    e.preventDefault()
    if (!nuovoNome.trim()) return
    try {
      await api.createPercorso(nuovoNome.trim(), token)
      setNuovoNome("")
      carica()
    } catch (err) {
      setErrore(err.message)
    }
  }

  const handleElimina = async (id) => {
    if (!confirm("Eliminare questo percorso e tutte le sue note?")) return
    try {
      await api.deletePercorso(id, token)
      carica()
    } catch (err) {
      setErrore(err.message)
    }
  }

  return (
    <RichiedeAuth>
      <div className="min-h-screen">
        <header className="border-b border-ink/10 px-6 py-5 flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">Percorso</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft hidden sm:inline">{user?.email}</span>
            <button onClick={logout} className="text-sm text-ink-soft hover:text-red-500 transition-colors">
              Esci
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-10">
          <form onSubmit={handleCrea} className="flex gap-2 mb-8">
            <input
              type="text"
              placeholder="Nome nuovo percorso (es. Stage Mia Academy)"
              value={nuovoNome}
              onChange={e => setNuovoNome(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-ink/15 bg-white focus:outline-none focus:ring-2 focus:ring-thread-light"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-thread text-white font-medium hover:bg-thread/90 transition-colors"
            >
              + Crea
            </button>
          </form>

          {errore && <p className="text-sm text-red-600 mb-4">{errore}</p>}

          {caricando ? (
            <p className="text-ink-soft text-sm">Caricamento…</p>
          ) : percorsi.length === 0 ? (
            <div className="text-center py-16 text-ink-soft">
              <p className="font-display text-xl mb-1">Nessun percorso ancora</p>
              <p className="text-sm">Crea il primo per iniziare a tenere traccia dei tuoi giorni.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {percorsi.map(p => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between bg-white border border-ink/10 rounded-xl px-5 py-4 hover:border-thread-light transition-colors cursor-pointer"
                  onClick={() => router.push(`/percorso/${p.id}`)}
                >
                  <div>
                    <p className="font-medium text-ink">{p.nome}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      creato il {new Date(p.created_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleElimina(p.id) }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-ink-soft hover:text-red-500 transition-all"
                  >
                    Elimina
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </RichiedeAuth>
  )
}

export default PercorsiPage
