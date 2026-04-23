import { ProtectedLayout } from "@/app/components/auth/ProtectedLayout"
import { Sidebar } from "@/app/components/layout/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 w-full pl-0 md:pl-72 p-6 md:p-8 pt-24 md:pt-8 transition-all">
          <div className="max-w-7xl mx-auto rounded-[3rem] bg-white w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}
