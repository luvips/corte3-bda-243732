'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Clock, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const CitaSchema = z.object({
  mascota_id: z.string().min(1, "Seleccione una mascota válida"),
  veterinario_id: z.string().min(1, "Seleccione un veterinario"),
  fecha: z.string().min(1, "Seleccione una fecha"),
  motivo: z.string().min(5, "El motivo debe ser detallado (min 5 chars)"),
})

type CitaForm = z.infer<typeof CitaSchema>

export default function AgendarCitaPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CitaForm>({
    resolver: zodResolver(CitaSchema) as any
  })

  const onSubmit = async (data: CitaForm) => {
    // Simulacion del Stored Procedure sp_agendar_cita (Reglas de negocio)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const fecha = new Date(data.fecha)
        const dia = fecha.getDay()
        
        // Mock error: Si veterinario 2 y eligen domingo (0)
        if (data.veterinario_id === "2" && dia === 6) { /* 6 es sabado ajustado a hora local mock. Vamos a mockear si elige un viernes? No, simplifiquemos: */ }
        
        // Vamos a hacer una validacion genérica de demostracion de Stored Procedure:
        if (data.veterinario_id === "4") {
          toast.error("Error de SP: Veterinario no encontrado o inactivo")
          resolve()
          return
        }

        if (data.veterinario_id === "1" && typeof data.fecha === 'string' && data.fecha.includes('04-13')) { // mock
           toast.error("Error de SP: El veterinario no trabaja ese día")
           resolve()
           return
        }

        toast.success("¡Cita agendada correctamente!")
        setTimeout(() => router.push('/mascotas'), 1500)
        resolve()
      }, 1000)
    })
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in w-full max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-3">Nueva Cita</h1>
        <p className="text-gray-500 font-medium">
          Validación estructurada en UI simulando SP.
        </p>
      </div>

      <div className="bg-[#c4addb] p-2 rounded-[3rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <div className="space-y-4">
                <label className="text-base font-extrabold text-gray-800 flex items-center gap-3">
                  <div className="bg-[#f4ec87] p-2 rounded-xl text-yellow-700"><PawPrintIcon /></div> ID Mascota
                </label>
                <Input type="number" placeholder="Ej: 1 (Firulais)" {...register("mascota_id")} className="bg-[#fcfcff] h-16 text-lg border-2 border-gray-100 rounded-2xl" />
                {errors.mascota_id && <p className="text-red-500 text-sm font-bold flex bg-red-50 p-2 rounded-xl">{errors.mascota_id.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-base font-extrabold text-gray-800 flex items-center gap-3">
                  <div className="bg-[#9cd1f0] p-2 rounded-xl text-sky-800"><Stethoscope className="w-4 h-4"/></div> Veterinario
                </label>
                <select 
                  {...register("veterinario_id")}
                  className="flex h-16 w-full rounded-2xl border-2 border-gray-100 bg-[#fcfcff] px-5 text-lg focus-visible:outline-none focus-visible:border-[var(--color-primary)] transition-all font-medium text-gray-700"
                >
                  <option value="">Seleccione al profesional...</option>
                  <option value="1">Dr. López (Descansa Lunes/Jueves)</option>
                  <option value="2">Dra. García (Descansa Domingo)</option>
                  <option value="3">Dr. Méndez</option>
                  <option value="4">Dra. Sánchez (Inactiva)</option>
                </select>
                {errors.veterinario_id && <p className="text-red-500 text-sm font-bold flex bg-red-50 p-2 rounded-xl">{errors.veterinario_id.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-base font-extrabold text-gray-800 flex items-center gap-3">
                  <div className="bg-[#c3f08c] p-2 rounded-xl text-lime-800"><CalendarIcon className="w-4 h-4"/></div> Fecha
                </label>
                <Input type="date" {...register("fecha")} className="bg-[#fcfcff] h-16 text-lg border-2 border-gray-100 rounded-2xl text-gray-700" />
                {errors.fecha && <p className="text-red-500 text-sm font-bold flex bg-red-50 p-2 rounded-xl">{errors.fecha.message}</p>}
              </div>

            </div>

            <div className="space-y-4 pt-4">
               <label className="text-base font-extrabold text-gray-800 flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-xl text-gray-600"><Clock className="w-4 h-4"/></div> Motivo
               </label>
               <Input placeholder="Ej: Revisión general, vómito, vacunas..." {...register("motivo")} className="bg-[#fcfcff] h-16 text-lg border-2 border-gray-100 rounded-2xl" />
               {errors.motivo && <p className="text-red-500 text-sm font-bold flex bg-red-50 p-2 rounded-xl">{errors.motivo.message}</p>}
            </div>

            <div className="pt-10 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-16 px-12 text-xl rounded-full bg-gray-900 text-white hover:scale-105 transition-transform border-none shadow-xl">
                {isSubmitting ? "Validando..." : "Confirmar Cita"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function PawPrintIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f59e0b]"><path d="M11 11a2.5 2.5 0 0 1-5 0V9a2.5 2.5 0 0 1 5 0v2z"/><path d="M20 11a2.5 2.5 0 0 1-5 0V9a2.5 2.5 0 0 1 5 0v2z"/><path d="M12 18.5c-4.14 0-7.5-3.36-7.5-7.5v-1a2.5 2.5 0 0 1 5 0v1h5v-1a2.5 2.5 0 0 1 5 0v1c0 4.14-3.36 7.5-7.5 7.5z"/></svg>
  )
}
