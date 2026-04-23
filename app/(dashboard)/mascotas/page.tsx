'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Syringe, Calendar, Phone, Edit, Trash2, X, Plus } from "lucide-react"
import { Card, CardContent } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

type Mascota = {
  id: number;
  nombre: string;
  especie: string;
  dueño: string;
}

export default function MascotasPage() {
  const router = useRouter()
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [rol, setRol] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  const [modal, setModal] = useState<{ open: boolean, type: 'historial' | 'editar' | 'eliminar' | 'vacunar' | null, mascota: Mascota | null }>({
    open: false,
    type: null,
    mascota: null
  })

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemAnim: any = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  useEffect(() => {
    const fetchMascotas = async () => {
      const session = JSON.parse(sessionStorage.getItem("usuario") || "{}")
      const currentRol = session.rol || "desconocido"
      setRol(currentRol)
      
      try {
        const queryParams = new URLSearchParams({ rol: currentRol });
        if (session.vet_id) queryParams.set('vet_id', session.vet_id.toString());
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }

        const response = await fetch(`/api/mascotas?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Error al cargar mascotas segmentadas via API');
        
        const data = await response.json();
        setMascotas(data);
      } catch (err) {
        toast.error('Hubo un error cargando el registro. Intenta mas tarde.');
      }
    }
    
    // Con debounce simple u omitible para el searchterm
    const delayDebounceFn = setTimeout(() => {
      fetchMascotas();
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const filteredMascotas = mascotas.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.especie.toLowerCase().includes(searchTerm.toLowerCase())
  )


  return (
    <div className="p-4 md:p-8 animate-fade-in w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-3">Pacientes</h1>
          <p className="text-gray-500 font-medium">
            Gestión de pacientes registrados en el sistema.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-4">
          <Badge variant={rol === "veterinario" ? "default" : "secondary"} className="h-10 px-6 py-2 text-sm rounded-full shadow-sm">
            {rol.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3 mb-10 w-full max-w-2xl">
        <div className="bg-gray-50 p-4 rounded-full ml-1">
          <Search className="w-6 h-6 text-gray-400" />
        </div>
        <Input 
          className="border-none shadow-none ring-0 focus-visible:ring-0 text-xl py-6 bg-transparent h-16 w-full"
          placeholder="Buscar por nombre o especie..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filteredMascotas.map((mascota, i) => {
          const pastelColors = ['bg-[#c4addb]', 'bg-[#9cd1f0]', 'bg-[#c3f08c]']
          const textColors = ['text-[#4c1d95]', 'text-[#075985]', 'text-[#3f6212]']
          
          const accentBg = pastelColors[i % pastelColors.length]
          const accentText = textColors[i % textColors.length]

          return (
            <motion.div key={mascota.id} variants={itemAnim} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="bg-white border hover:border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden group transition-all duration-300 flex flex-col h-full">
                
                <CardContent className="p-0 flex flex-col h-full relative">
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 mix-blend-overlay pointer-events-none"></div>

                  <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-2xl font-extrabold shadow-sm", accentBg, accentText)}>
                        {mascota.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{mascota.nombre}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">ID: {mascota.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-8 py-4 space-y-4 flex-1">
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-3xl">
                      <span className="text-gray-500 font-semibold text-sm">Especie</span>
                      <Badge className={cn("font-bold border-none shadow-none text-sm", accentBg, accentText)}>
                         {mascota.especie}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-3xl">
                      <span className="text-gray-500 font-semibold text-sm">Dueño</span>
                      <span className="text-gray-900 font-bold text-right">{mascota.dueño}</span>
                    </div>
                  </div>

                  {/* Acciones por Rol */}
                  <div className="p-6 pt-2">
                    
                    {rol === "veterinario" && (
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => setModal({ open: true, type: 'historial', mascota })}
                          className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-sm font-bold text-base transition-transform hover:scale-105"
                        >
                          <FileText className="w-5 h-5 mr-2" />
                          Historial
                        </Button>
                        <Button 
                          onClick={() => setModal({ open: true, type: 'vacunar', mascota })}
                          variant="outline" 
                          className={cn("w-12 h-12 p-0 rounded-full border-none shadow-sm transition-transform hover:scale-105", accentBg, accentText)}
                        >
                           <Syringe className="w-5 h-5" />
                        </Button>
                      </div>
                    )}

                    {rol === "recepcion" && (
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => router.push(`/mascotas/agendar`)}
                          className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-sm font-bold text-base transition-transform hover:scale-105"
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Agendar
                        </Button>
                        <Button 
                          onClick={() => toast.info(`Llamando al dueño: ${mascota.dueño}...`)}
                          variant="outline" 
                          className={cn("w-12 h-12 p-0 rounded-full border-none shadow-sm transition-transform hover:scale-105", accentBg, accentText)}
                        >
                          <Phone className="w-5 h-5" />
                        </Button>
                      </div>
                    )}

                    {rol === "admin" && (
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => setModal({ open: true, type: 'editar', mascota })}
                          variant="outline" 
                          className="flex-1 h-12 rounded-full border-2 border-gray-100 font-bold hover:bg-gray-50 transition-transform hover:scale-105 text-gray-700"
                        >
                          <Edit className="w-5 h-5 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          onClick={() => setModal({ open: true, type: 'eliminar', mascota })}
                          variant="destructive" 
                          className="w-12 h-12 p-0 rounded-full font-bold bg-red-100 text-red-600 hover:bg-red-200 shadow-none border-none transition-transform hover:scale-105"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
        {filteredMascotas.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-xl font-medium">No se encontraron mascotas que coincidan con la búsqueda.</p>
          </div>
        )}
      </motion.div>

      {/* Floating Modals System */}
      <AnimatePresence>
        {modal.open && modal.mascota && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setModal({ ...modal, open: false })}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-10 z-10"
            >
              <button 
                onClick={() => setModal({ ...modal, open: false })}
                className="absolute top-8 right-8 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {modal.type === 'historial' && (
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Historial Médico</h2>
                  <p className="text-gray-500 font-medium mb-8">Revisando expediente de <span className="font-bold text-gray-800">{modal.mascota.nombre}</span></p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="p-5 bg-[#f0f9ff] text-[#075985] rounded-3xl font-medium border border-[#ccf0ff]">
                      <span className="font-bold block mb-1">Hace 2 meses</span>
                      Desparasitación general y revisión dental. Todo en orden.
                    </div>
                    <div className="p-5 bg-gray-50 text-gray-600 rounded-3xl font-medium border border-gray-100">
                      <span className="font-bold block mb-1">Hace 6 meses</span>
                      Presentó leve dermatitis, tratada con antibióticos.
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 rounded-[2rem] bg-gray-900 text-white font-bold text-lg"
                    onClick={async () => {
                       try {
                         const session = JSON.parse(sessionStorage.getItem("usuario") || "{}")
                         // Llamada API comprobatoria de RLS 
                         await fetch(`/api/mascotas/${modal.mascota!.id}/historial?rol=${session.rol}&vet_id=${session.vet_id}`)
                         toast.success("Nueva nota añadida al expediente")
                       } catch (e) {
                         toast.error("Error cargando expediente (RLS)")
                       }
                       setModal({ ...modal, open: false })
                    }}
                  >
                    <Plus className="w-5 h-5 mr-3" /> Añadir Nota Clínica
                  </Button>
                </div>
              )}

              {modal.type === 'vacunar' && (
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Asignar Vacuna</h2>
                  <p className="text-gray-500 font-medium mb-8">Paciente: <span className="font-bold text-gray-800">{modal.mascota.nombre}</span></p>
                  
                  <div className="space-y-4 mb-8">
                    <select className="w-full h-16 px-6 bg-gray-50 border-2 border-gray-100 rounded-3xl text-lg font-medium text-gray-700 outline-none focus:border-[#0d9488]">
                      <option>Rabia Canina / Felina</option>
                      <option>Parvovirus</option>
                      <option>Leucemia Felina</option>
                    </select>
                  </div>

                  <Button 
                    className="w-full h-16 rounded-[2rem] bg-[#0d9488] text-white font-bold text-lg shadow-sm"
                    onClick={async () => {
                       try {
                         const session = JSON.parse(sessionStorage.getItem("usuario") || "{}")
                         const response = await fetch('/api/vacunacion', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ 
                                mascota_id: modal.mascota!.id,
                                vacuna_id: 1, 
                                veterinario_id: session.vet_id || 1, 
                                costo_cobrado: 350.00,
                                rol: session.rol
                             })
                         });
                         if (!response.ok) throw new Error('Falla en transaccion');
                         toast.success("Vacuna exitosa: Se invalidó el Caché en Redis y PG guardó")
                       } catch (e) {
                         toast.error("Motor Denegado: Tu perfil probablemente tiene REVOCADO el acceso DML o RLS filtró.")
                       }
                       setModal({ ...modal, open: false })
                    }}
                  >
                    Confirmar Receta
                  </Button>
                </div>
              )}

              {modal.type === 'editar' && (
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Editar Información</h2>
                  <p className="text-gray-500 font-medium mb-8">Privilegio de Administrador</p>
                  
                  <div className="space-y-4 mb-8">
                    <Input defaultValue={modal.mascota.nombre} className="h-16 px-6 bg-gray-50 border-2 border-gray-100 rounded-3xl text-lg font-bold" />
                    <Input defaultValue={modal.mascota.dueño} className="h-16 px-6 bg-gray-50 border-2 border-gray-100 rounded-3xl text-lg font-medium text-gray-600" />
                  </div>

                  <Button 
                    variant="outline"
                    className="w-full h-16 rounded-[2rem] border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold text-lg transition-colors"
                    onClick={() => {
                       toast.success("Cambios guardados en la Base de Datos")
                       setModal({ ...modal, open: false })
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              )}

              {modal.type === 'eliminar' && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-4">¿Eliminar Registro?</h2>
                  <p className="text-gray-500 font-medium mb-8">
                     Estás a punto de eliminar definitivamente a <span className="font-bold text-gray-800">{modal.mascota.nombre}</span> del sistema. Esta acción es irreversible (mock cascade delete).
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <Button 
                        variant="outline"
                        className="h-16 rounded-[2rem] font-bold text-lg"
                        onClick={() => setModal({ ...modal, open: false })}
                     >
                        Cancelar
                     </Button>
                     <Button 
                        className="h-16 rounded-[2rem] bg-red-600 text-white font-bold text-lg hover:bg-red-700"
                        onClick={() => {
                           toast.error("El registro del paciente ha sido eliminado.")
                           setModal({ ...modal, open: false })
                        }}
                     >
                        Sí, Eliminar
                     </Button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
