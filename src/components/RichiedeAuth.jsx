"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const RichiedeAuth = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-ink-soft">Caricamento…</div>
  }

  return children
}

export default RichiedeAuth
