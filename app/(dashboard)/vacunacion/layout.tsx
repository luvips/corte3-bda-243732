'use client'

import { ProtectedLayout } from "@/app/components/auth/ProtectedLayout"

export default function VacunacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={["veterinario", "admin"]}>
      {children}
    </ProtectedLayout>
  )
}
