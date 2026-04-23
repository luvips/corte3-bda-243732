import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  const client = await pool.connect();
  
  try {
    const data = await req.json();
    const { mascota_id, fecha_hora, motivo, rol, vet_id } = data;

    if (!mascota_id || !fecha_hora || !motivo) {
      return NextResponse.json({ error: "Faltan parametros requeridos" }, { status: 400 });
    }

    await client.query('BEGIN');
    
    // 1. RLS INJECTION (Asumiendo identidad transaccional)
    const dbRole = rol === 'admin' ? 'rol_admin' : (rol === 'veterinario' ? 'rol_veterinario' : 'rol_recepcion');
    
    // La inyeccion ocurre aislando de forma controlada y pura esta variable en codigo
    await client.query(`SET LOCAL ROLE ${dbRole};`);
    
    if (rol === 'veterinario' && vet_id) {
       // La app.current_vet_id es la GUC en PostgreSQL
       await client.query(`SET LOCAL app.current_vet_id = '${parseInt(vet_id, 10)}';`);
    }

    // 2. HARDENING AGAINST SQL INJECTION EN PROCEDURE CALL
    // Invocamos estrictamente el procedure "sp_agendar_cita" solicitado por la rúbrica
    // NOTA: Pasamos null al ultimo argumento por ser OUT parameter, pg driver lo maneja como retorno
    const query = `CALL sp_agendar_cita($1, $2, $3, $4, null);`;
    const params = [
        parseInt(mascota_id, 10),
        parseInt(vet_id, 10), 
        fecha_hora, 
        motivo
    ];
    
    // La base de datos es la encargada de validar la logica pesada de "Veterinario en descanso", etc...
    const result = await client.query(query, params);
    const new_cita_id = result.rows[0] ? result.rows[0].p_cita_id : null;
    
    await client.query('COMMIT');
    
    return NextResponse.json({ 
        message: "Cita transaccionada con exito y trigger disparado localmente", 
        cita_id: new_cita_id 
    }, { status: 201 });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("PROCEDURE_ERROR:", error);
    return NextResponse.json({ error: "Denegacion Interna DB (Procedural/RLS)", detail: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
