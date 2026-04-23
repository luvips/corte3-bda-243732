import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { rol, credencial, pin } = await req.json();

    if (!rol || !credencial) {
        return NextResponse.json({ error: 'Faltan campos obligatorios (rol, credencial)' }, { status: 400 });
    }

    // 1. Veterinario -> Valiación estricta a Nivel de Base de Datos + PIN Maestro
    if (rol === 'veterinario') {
       if (pin !== process.env.PASSWORD_VETERINARIO) {
           return NextResponse.json({ error: 'PIN corporativo de clínica incorrecto' }, { status: 401 });
       }
       
       const query = `SELECT id, nombre FROM veterinarios WHERE cedula = $1 AND activo = TRUE LIMIT 1`;
       
       // Hardening (Regla de Corte 3): Prevenir Injection en Inicios de Sesión
       const { rows } = await pool.query(query, [credencial]);
       
       if (rows.length === 0) {
           return NextResponse.json({ error: 'Cédula Profesional inválida o usuario inactivo' }, { status: 401 });
       }
       
       // Exito
       return NextResponse.json({ 
           rol: 'veterinario', 
           vet_id: rows[0].id, 
           nombre: rows[0].nombre 
        }, { status: 200 });
    }

    // 2. Administrador -> Validación contra variable de Entorno GitIgnored
    if (rol === 'admin') {
       if (credencial !== process.env.PASSWORD_ADMIN) {
           return NextResponse.json({ error: 'Credenciales del servidor maestro incorrectas' }, { status: 401 });
       }
       return NextResponse.json({ rol: 'admin', vet_id: null }, { status: 200 });
    }

    // 3. Recepción -> Validación contra variable de Entorno GitIgnored
    if (rol === 'recepcion') {
       if (credencial !== process.env.PASSWORD_RECEPCION) {
           return NextResponse.json({ error: 'Credenciales del corporativo incorrectas' }, { status: 401 });
       }
       return NextResponse.json({ rol: 'recepcion', vet_id: null }, { status: 200 });
    }

    return NextResponse.json({ error: 'Rol desconocido o no registrado localmente' }, { status: 400 });
  } catch (error) {
    console.error("AUTH_ERROR", error);
    return NextResponse.json({ error: 'Error del servidor durante el proceso de Auth' }, { status: 500 });
  }
}
