'use client'

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "veterinario" | "recepcion" | "admin"

interface AuthSession {
  rol: UserRole
  vet_id: number | null
}

export function ProtectedLayout({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Lee la sesión desde sessionStorage de manera sincronizada despues del primer render.
    const rawSession = sessionStorage.getItem("usuario")
    if (!rawSession) {
      router.replace("/") // No hay sesion, va al login
      return
    }
    try {
      const session: AuthSession = JSON.parse(rawSession)
      if (allowedRoles && !allowedRoles.includes(session.rol)) {
        router.replace("/") // Rol no permitido
        return
      }
      setIsAuthorized(true)
    } catch {
      router.replace("/")
    }
  }, [allowedRoles, router, pathname])

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-[var(--color-primary)] border-r-[var(--color-accent)] border-b-[var(--color-secondary)] border-l-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Autenticando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
