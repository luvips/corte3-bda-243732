'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  HeartPulse,
  PawPrint,
  CalendarDays,
  Syringe,
  Settings,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const ALL_NAV_ITEMS = [
  { name: "Mascotas",     path: "/mascotas",         icon: PawPrint,    color: "bg-[#c4addb]", roles: ["veterinario", "recepcion", "admin"] },
  { name: "Agendar Cita", path: "/mascotas/agendar", icon: CalendarDays, color: "bg-[#9cd1f0]", roles: ["veterinario", "recepcion", "admin"] },
  { name: "Vacunación",   path: "/vacunacion",        icon: Syringe,     color: "bg-[#c3f08c]", roles: ["veterinario", "admin"] },
  { name: "Panel Admin",  path: "/admin",             icon: Settings,    color: "bg-[#fef08a]", roles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [rol, setRol] = useState<string | null>(null)

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem("usuario") || "{}")
    setRol(session.rol || null)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("usuario")
    router.replace("/")
  }

  const navItems = rol
    ? ALL_NAV_ITEMS.filter(item => item.roles.includes(rol))
    : []

  return (
    <aside className="w-64 fixed top-8 bottom-8 left-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] flex flex-col hidden md:flex overflow-hidden z-40">
      <div className="p-8 pb-4 flex items-center justify-center flex-col gap-4">
        <div className="bg-[#f0f9ff] p-4 rounded-[2rem]">
          <HeartPulse className="w-10 h-10 text-[#0d9488]" />
        </div>
        <span className="font-bold text-2xl text-gray-800 tracking-tight">HappyPets</span>
      </div>
      
      <nav className="flex-1 px-5 mt-6 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <motion.div key={item.path} whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={item.path}
                prefetch={true}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-3xl font-bold transition-all duration-300",
                  isActive 
                    ? `${item.color} text-gray-900 shadow-sm border border-black/5` 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive ? "text-gray-900" : "")} />
                <span className="text-lg">{item.name}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="p-5 mt-auto border-t border-gray-100">
        <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 text-gray-500 hover:bg-red-50 hover:text-red-600 w-full rounded-3xl transition-colors font-bold"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-lg">Salir</span>
          </button>
        </motion.div>
      </div>
    </aside>
  )
}
