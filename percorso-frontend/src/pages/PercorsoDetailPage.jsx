import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { api } from "../api.js"

const formattaData = (isoString) =>
  new Date(isoString).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })

const formattaPeriodo = (from, to) =>
  `${new Date(from).toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${new Date(to).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}`

const PercorsoDetailPage = () => {
  const { id } = useParams()
  const { token } = useAuth()

  const [note, setNote] = useState([])
  const [periodi, setPeriodi] = useState({ settimane: [], mesi: [] })
  const [caricando, setCaricando] = useState(true)
  const [nuovaNota, setNuovaNota] = useState("")
  const [errore, setErrore] = useState("")

  const [periodoSelezionato, setPeriodoSelezionato] = useState(null) // { from, to } | null = tutto

  const caricaNote = async (periodo = periodoSelezionato) => {
    setCaricando(true)
    try {
      const data = await api.getNote(id, token, periodo || {})
      setNote(data)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setCaricando(false)
    }
  }

  const caricaPeriodi = async () => {
    try {
      const data = await api.getPeriodi(id, token)
      setPeriodi(data)
    } catch (err) {
      setErrore(err.message)
    }
  }

  useEffect(() => {
    caricaNote({})
    caricaPeriodi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAggiungiNota = async (e) => {
    e.preventDefault()
    if (!nuovaNota.trim()) return
    try {
      await api.addNota(id, nuovaNota.trim(), null, token)
      setNuovaNota("")
      caricaNote({})
      caricaPeriodi()
      setPeriodoSelezionato(null)
    } catch (err) {
      setErrore(err.message)
    }
  }

  const handleEliminaNota = async (notaId) => {
    try {
      await api.deleteNota(id, notaId, token)
      caricaNote()
      caricaPeriodi()
    } catch (err) {
      setErrore(err.message)
    }
  }

  const selezionaPeriodo = (periodo) => {
    setPeriodoSelezionato(periodo)
    caricaNote(periodo || {})
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 px-6 py-5">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink transition-colors">← Tutti i percorsi</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Aggiungi nota */}
        <form onSubmit={handleAggiungiNota} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Cosa hai fatto oggi?"
            value={nuovaNota}
            onChange={e => setNuovaNota(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-ink/15 bg-white focus:outline-none focus:ring-2 focus:ring-thread-light"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-thread text-white font-medium hover:bg-thread/90 transition-colors"
          >
            Aggiungi
          </button>
        </form>

        {/* Filtri periodo */}
        {(periodi.settimane.length > 0 || periodi.mesi.length > 0) && (
          <div className="mb-8 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => selezionaPeriodo(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !periodoSelezionato ? "bg-thread text-white" : "bg-white border border-ink/15 text-ink-soft hover:border-thread-light"
                }`}
              >
                Tutto
              </button>
              {periodi.mesi.map(m => (
                <button
                  key={m.from}
                  onClick={() => selezionaPeriodo(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    periodoSelezionato?.from === m.from ? "bg-thread text-white" : "bg-white border border-ink/15 text-ink-soft hover:border-thread-light"
                  }`}
                >
                  {new Date(m.from).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                </button>
              ))}
            </div>
            {periodi.settimane.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {periodi.settimane.map(s => (
                  <button
                    key={s.from}
                    onClick={() => selezionaPeriodo(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      periodoSelezionato?.from === s.from ? "bg-gold text-white" : "bg-white border border-ink/15 text-ink-soft hover:border-gold"
                    }`}
                  >
                    Sett. {formattaPeriodo(s.from, s.to)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {errore && <p className="text-sm text-red-600 mb-4">{errore}</p>}

        {/* Elenco note, stile "filo" verticale */}
        {caricando ? (
          <p className="text-ink-soft text-sm">Caricamento…</p>
        ) : note.length === 0 ? (
          <div className="text-center py-16 text-ink-soft">
            <p className="font-display text-xl mb-1">Nessuna nota in questo periodo</p>
            <p className="text-sm">Scrivi la prima riga qui sopra.</p>
          </div>
        ) : (
          <div className="relative pl-6 flex flex-col gap-5">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink/10" />
            {note.map(n => (
              <div key={n.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-thread-light" />
                <p className="text-xs text-ink-soft font-medium mb-1">{formattaData(n.data)}</p>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-ink text-[15px]">{n.contenuto}</p>
                  <button
                    onClick={() => handleEliminaNota(n.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-ink-soft hover:text-red-500 transition-all shrink-0"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default PercorsoDetailPage
