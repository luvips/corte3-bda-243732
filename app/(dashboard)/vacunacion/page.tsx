'use client'

import { useState } from "react"
import { Database, Zap, RefreshCw, Syringe } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"

const PENDIENTES_MOCK = [
  { id: 1, mascota: "Firulais", especie: "Perro", vacuna: "Parvovirus canino", stock: 12 },
  { id: 2, mascota: "Luna", especie: "Gato", vacuna: "Leucemia felina", stock: 4 },
  { id: 3, mascota: "Max", especie: "Perro", vacuna: "Antirrábica canina", stock: 25 },
]

export default function VacunacionPage() {
  const [data, setData] = useState(PENDIENTES_MOCK)
  const [source, setSource] = useState<"database" | "cache">("database")
  const [loading, setLoading] = useState(false)

  const reloadData = (forcedSource?: "database" | "cache") => {
    setLoading(true)
    setTimeout(() => {
      // Toggle logic or enforce source
      if (forcedSource) {
        setSource(forcedSource)
      } else {
        setSource(prev => prev === "database" ? "cache" : "database")
      }
      setLoading(false)
      
      if (forcedSource === "database" || source === "cache") {
        toast.info("Cache Redis invalidado. Siguiente carga vendrá de DB.", { icon: <Database className="w-4 h-4 text-blue-500"/> })
      } else {
        toast.success("Datos obtenidos rápidamente desde Redis.", { icon: <Zap className="w-4 h-4 text-[#f59e0b]"/> })
      }
    }, 600)
  }

  const handleAplicarVacuna = (id: number) => {
    // Remove from mock list
    setData(prev => prev.filter(v => v.id !== id))
    toast.success("Vacuna insertada en DB correctamente.")
    // Applying a vaccine invalidates cache in backend
    reloadData("database")
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-3">Vacunación</h1>
          <p className="text-gray-500 font-medium">
            Monitor en caliente usando caché o BD.
          </p>
        </div>
        
        <div className="mt-6 md:mt-0 flex gap-4 items-center">
          <Button variant="outline" onClick={() => reloadData()} disabled={loading} className="rounded-full shadow-sm border-2 border-gray-100 hover:bg-gray-50">
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Forzar Recarga
          </Button>
          
          <div className="flex bg-white px-5 py-3 rounded-full border-2 border-gray-100 items-center gap-3 shadow-sm">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fuente:</span>
            {source === "cache" ? (
              <Badge variant="accent" className="bg-[#f4ec87] text-[#4d7c0f] px-4 py-1.5 flex items-center gap-2 shadow-sm text-sm">
                <Zap className="w-4 h-4 fill-current" /> REDIS HIT
              </Badge>
            ) : (
              <Badge variant="default" className="bg-[#9cd1f0] text-[#075985] px-4 py-1.5 flex items-center gap-2 shadow-sm text-sm">
                <Database className="w-4 h-4" /> POSTGRES
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((item, i) => {
          const pastelColors = ['bg-[#c4addb]', 'bg-[#9cd1f0]', 'bg-[#c3f08c]']
          const colorClass = pastelColors[i % pastelColors.length]
          return (
            <div key={item.id} className={cn(colorClass, "p-6 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:scale-[1.01] transition-transform")}>
              <div className="flex items-center gap-6">
                <div className="bg-white/40 backdrop-blur-md w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 text-3xl font-bold text-gray-800 shadow-sm border border-white/20">
                  {item.mascota.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-none mb-2">{item.mascota}</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/50 px-3 py-1 rounded-full text-sm font-bold text-gray-700">{item.especie}</span>
                    <span className="text-gray-800 font-bold flex items-center gap-2"><Syringe className="w-4 h-4"/> {item.vacuna}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center bg-white/40 p-3 rounded-[1.5rem] min-w-[100px]">
                  <p className="text-xs font-bold uppercase text-gray-600 mb-1">Stock</p>
                  <p className={cn("text-2xl font-extrabold", item.stock >= 10 ? "text-gray-900" : "text-red-600")}>
                    {item.stock}
                  </p>
                </div>
                <Button 
                  className="rounded-full bg-white text-gray-900 hover:bg-gray-50 hover:scale-105 transition-all shadow-sm h-14 px-8 text-base font-bold border-none"
                  onClick={() => handleAplicarVacuna(item.id)}
                >
                  Aplicar Vacuna
                </Button>
              </div>
            </div>
          )
        })}
        {data.length === 0 && (
          <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-xl font-medium">No hay vacunaciones pendientes registradas.</p>
          </div>
        )}
      </div>
    </div>
  )
}
