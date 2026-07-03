import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import PercorsiPage from "./pages/PercorsiPage.jsx"
import PercorsoDetailPage from "./pages/PercorsoDetailPage.jsx"

const RichiedeAuth = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink-soft">Caricamento…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RichiedeAuth>
            <PercorsiPage />
          </RichiedeAuth>
        }
      />
      <Route
        path="/percorso/:id"
        element={
          <RichiedeAuth>
            <PercorsoDetailPage />
          </RichiedeAuth>
        }
      />
    </Routes>
  )
}

export default App
