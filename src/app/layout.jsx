import { AuthProvider } from "@/context/AuthContext"
import "./globals.css"

export const metadata = {
  title: "Percorso",
  description: "Il filo che tiene insieme i tuoi giorni",
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
