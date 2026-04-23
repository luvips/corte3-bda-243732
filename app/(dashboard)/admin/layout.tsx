'use client'

import { ProtectedLayout } from "@/app/components/auth/ProtectedLayout"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      {children}
    </ProtectedLayout>
  )
}
