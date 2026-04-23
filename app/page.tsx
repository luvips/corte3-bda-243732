'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stethoscope, KeySquare, ShieldCheck, HeartPulse } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [credencial, setCredencial] = useState<string>("")
  const [vetPin, setVetPin] = useState<string>("")
  const [vetStep, setVetStep] = useState<number>(1)
  const [successName, setSuccessName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [vetsList, setVetsList] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/public/veterinarios')
      .then(r => r.json())
      .then(data => setVetsList(Array.isArray(data) ? data : []))
      .catch(() => setVetsList([])) // Tolerancia a fallos de bd
  }, [])

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Si somos veterinario en paso 1, solo simulamos el avance
    if (selectedRole === 'veterinario' && vetStep === 1) {
       if (!vetPin) return toast.error("Ingresa el PIN de la clínica");
       setVetStep(2);
       return;
    }

    if (!selectedRole || !credencial) return toast.error("Llena tus datos para continuar");

    setLoading(true);
    toast.info(`Autenticando en Base de Datos...`)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: selectedRole, credencial, pin: vetPin })
      });
      
      const sessionData = await response.json();
      if (!response.ok) throw new Error(sessionData.error || 'Credenciales o Servidor inválido');
      
      sessionStorage.setItem("usuario", JSON.stringify(sessionData));
      
      if (selectedRole === 'veterinario') {
         // Activar la pantalla temporal de bienvenida por 2.5s antes de ruteo
         setSuccessName(sessionData.nombre);
         setTimeout(() => {
            router.push("/mascotas");
         }, 2500);
      } else {
         toast.success(`¡Bienvenido al sistema!`);
         router.push("/mascotas");
      }

    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const titleVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  }

  const letterVariants: any = {
    hidden: { opacity: 0, y: 40, scale: 0.8, rotateX: -90 },
    show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 12 } }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-white">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#c4addb] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#9cd1f0] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 z-10"
      >
        <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-8">
          <motion.div variants={itemVariants} className="bg-[#f0f9ff] p-6 rounded-[2.5rem] shadow-sm">
            <HeartPulse className="w-20 h-20 text-[#0d9488]" />
          </motion.div>
          
          <motion.h1 variants={titleVariants} initial="hidden" animate="show" className="text-[5.5rem] md:text-[8rem] 2xl:text-[9rem] font-extrabold flex items-center tracking-tighter leading-none perspective-1000">
            {['K','O','T','A','R','O'].map((letter, i) => (
              <motion.span 
                key={i} 
                variants={letterVariants} 
                className={cn(
                  "inline-block",
                  i >= 4 ? "text-transparent bg-clip-text bg-gradient-to-r from-[#0d9488] to-[#9cd1f0]" : "text-gray-900"
                )}
                style={{ transformOrigin: "bottom" }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-2xl text-gray-500 max-w-lg font-medium leading-relaxed">
            Una plataforma moderna y profesional diseñada exclusivamente para facilitar la vida de nuestro equipo médico.
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-lg bg-white/60 backdrop-blur-3xl border border-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            
            <AnimatePresence mode="wait">
              {successName ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                   <div className="w-24 h-24 bg-[#e0f2fe] rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Stethoscope className="w-12 h-12 text-[#0369a1] animate-bounce" />
                   </div>
                   <h2 className="text-3xl font-extrabold text-[#075985]">¡Bienvenido de vuelta!</h2>
                   <p className="text-xl font-bold text-gray-800">{successName}</p>
                   <p className="text-gray-500 font-medium animate-pulse">Desencriptando bóveda de pacientes y RLS...</p>
                </motion.div>
              ) : !selectedRole ? (
                <motion.div key="selector" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">Selecciona tu Rol</h2>
                    <p className="text-gray-500 font-medium mt-3">Base de datos requerirá Auth Fuerte.</p>
                  </div>

                  <div className="space-y-5">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full h-20 text-xl font-bold justify-start px-8 bg-[#9cd1f0]/40 text-[#075985] hover:bg-[#9cd1f0]/60 border-none rounded-[2rem]"
                        onClick={() => { setSelectedRole("veterinario"); setVetStep(1); }}
                      >
                        <Stethoscope className="mr-5 w-8 h-8" /> Veterinario Operativo
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full h-20 text-xl font-bold justify-start px-8 bg-[#c4addb]/30 text-[#4c1d95] hover:bg-[#c4addb]/50 border-none rounded-[2rem]"
                        onClick={() => setSelectedRole("recepcion")}
                      >
                        <KeySquare className="mr-5 w-8 h-8" /> Personal de Recepción
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full h-20 text-xl font-bold justify-start px-8 bg-[#c3f08c]/40 text-[#3f6212] hover:bg-[#c3f08c]/60 border-none rounded-[2rem]"
                        onClick={() => setSelectedRole("admin")}
                      >
                        <ShieldCheck className="mr-5 w-8 h-8" /> Gerencia y Admin
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 capitalize">Portal {selectedRole}</h2>
                    <p className="text-gray-500 font-medium mt-3">Por favor autentícate</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      {selectedRole === 'veterinario' && vetStep === 1 && (
                        <div className="mb-4">
                           <label className="block text-sm font-bold text-gray-700 mb-2">PIN Autorizado de la Clínica</label>
                           <input 
                             type="password"
                             value={vetPin}
                             onChange={(e) => setVetPin(e.target.value)}
                             placeholder="••••••••"
                             className="w-full h-16 px-6 text-xl tracking-widest text-center border-2 border-gray-100 rounded-[1.5rem] bg-white focus:outline-none focus:border-[#9cd1f0] focus:ring-4 focus:ring-[#9cd1f0]/20 font-bold text-gray-900 mb-4"
                             required
                           />
                        </div>
                      )}

                      {selectedRole === 'veterinario' && vetStep === 2 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                          <label className="block text-sm font-bold text-[#075985] mb-2">Selecciona tu Perfil Médico</label>
                          <select className="w-full h-14 px-4 text-base border-2 border-gray-100 rounded-[1rem] bg-gray-50 focus:outline-none focus:border-[#9cd1f0] font-medium text-gray-900 appearance-none mb-6">
                            <option value="">Selecciona quién eres...</option>
                            {vetsList.map(vet => (
                              <option key={vet.id} value={vet.id}>
                                {vet.nombre} {vet.activo ? '' : '(Inactivo)'}
                              </option>
                            ))}
                          </select>
                          
                          <label className="block text-sm font-bold text-[#075985] mb-2">Cédula Profesional (Firma)</label>
                          <input 
                            type="text"
                            value={credencial}
                            onChange={(e) => setCredencial(e.target.value)}
                            placeholder="VET-XXXX-XXX"
                            className="w-full h-16 px-6 text-lg border-2 border-gray-100 rounded-[1.5rem] bg-white focus:outline-none focus:border-[#0d9488] focus:ring-4 focus:ring-[#0d9488]/10 transition-all font-medium text-gray-900"
                            required
                          />
                        </motion.div>
                      )}
                      
                      {selectedRole !== 'veterinario' && (
                        <>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                             PIN Secreto Maestro
                          </label>
                          <input 
                            type="password"
                            value={credencial}
                            onChange={(e) => setCredencial(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-16 px-6 text-lg border-2 border-gray-100 rounded-[1.5rem] bg-white focus:outline-none focus:border-[#0d9488] transition-all font-medium text-gray-900"
                            required
                          />
                        </>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() => { 
                           if (selectedRole === 'veterinario' && vetStep === 2) setVetStep(1);
                           else { setSelectedRole(null); setCredencial(''); setVetPin(''); }
                        }}
                        className="h-16 w-1/3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-[2rem] font-bold"
                      > Volver </Button>
                      
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-16 w-2/3 bg-[#0d9488] text-white hover:bg-[#0f766e] rounded-[2rem] font-bold text-lg"
                      > 
                        {selectedRole === 'veterinario' && vetStep === 1 ? 'Siguiente' : 'Entrar'} 
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
