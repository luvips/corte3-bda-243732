import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rol = searchParams.get('rol');
  const vetIdStr = searchParams.get('vet_id');
  const searchTerm = searchParams.get('search') || '';

  if (!rol) {
    return NextResponse.json({ error: 'Falta rol en el contexto de autenticacion.' }, { status: 400 });
  }

  // Obtenemos una conexion exclusiva del pool para asegurar aislamiento del SET LOCAL
  const client = await pool.connect();
  
  try {
    // Iniciamos transaccion virtual (o manejado por el setting local que caduca tras el query)
    await client.query('BEGIN');

    // ==============================================================
    // REQUISITO CORTE 3: RLS Context Injection
    // Asignamos el rol para limitar visualizacion automaticamente 
    // dictado por Postgres, no filtrando arrays en Node.
    // ==============================================================
    const dbRole = rol === 'admin' ? 'rol_admin' : (rol === 'recepcion' ? 'rol_recepcion' : 'rol_veterinario');
    
    // Hardening: Nunca concatenar variables del usuario directo al SET ROLE
    await client.query(`SET LOCAL ROLE ${dbRole};`);
    
    if (rol === 'veterinario' && vetIdStr) {
      // Inyectamos variable GUC validando que solo pasamos un parametro alfanumerico base
      await client.query(`SET LOCAL app.current_vet_id = '${parseInt(vetIdStr, 10)}';`);
    }

    // ==============================================================
    // REQUISITO CORTE 3: Hardening contra SQL Injection
    // Uso de PREPARED STATEMENTS: El driver `pg` enviara la query y
    // el array `params` por separado. PostgreSQL lo compila y luego ata el valor
    // previniendo cualquier DROP TABLE oculto en `searchTerm`.
    // ==============================================================
    let finalQuery;
    let params: any[] = [];

    if (searchTerm) {
       finalQuery = `
          SELECT m.id, m.nombre, m.especie, d.nombre as "dueño" 
          FROM mascotas m
          JOIN duenos d ON m.dueno_id = d.id
          WHERE m.nombre ILIKE $1 OR m.especie ILIKE $1
          ORDER BY m.id DESC;
       `;
       params = [`%${searchTerm}%`];
    } else {
       finalQuery = `
          SELECT m.id, m.nombre, m.especie, d.nombre as "dueño" 
          FROM mascotas m
          JOIN duenos d ON m.dueno_id = d.id
          ORDER BY m.id DESC;
       `;
    }

    const { rows } = await client.query(finalQuery, params);
    
    await client.query('COMMIT');
    return NextResponse.json(rows, { status: 200 });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("PG_ERROR:", error);
    return NextResponse.json({ error: 'Operacion de Base de Datos Fallo.', detail: error.message }, { status: 500 });
  } finally {
    // Liberar conexion al pool es CRITICO para no ahogar la base de datos
    client.release();
  }
}
