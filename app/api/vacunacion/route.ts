import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import Redis from 'ioredis';

// Conexión Centralizada a Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

export async function GET(req: Request) {
  const cacheKey = 'vacunacion_pendientes_cache';
  
  try {
    // 1. Verificamos REDIS primero (Cache-Aside pattern)
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('✔️ Redis HIT: Retornando datos en cache para v_mascotas_vacunacion_pendiente');
      return NextResponse.json(JSON.parse(cachedData), { 
        status: 200, 
        headers: { 'X-Cache': 'HIT' }
      });
    }

    console.log('❌ Redis MISS: Procesando peticion desde PostgreSQL...');
    
    // 2. Si no hay HIT, consultamos a PG (con Roles RLS aplicados por seguridad)
    const { searchParams } = new URL(req.url);
    const rol = searchParams.get('rol');
    
    const client = await pool.connect();
    let rows = [];
    
    try {
      await client.query('BEGIN');
      const dbRole = rol === 'admin' ? 'rol_admin' : (rol === 'veterinario' ? 'rol_veterinario' : 'rol_recepcion');
      await client.query(`SET LOCAL ROLE ${dbRole};`);

      // La vista NO tiene parametros de usuario, por lo que es segura contra SQL Injection directamente
      const res = await client.query('SELECT * FROM v_mascotas_vacunacion_pendiente');
      rows = res.rows;
      await client.query('COMMIT');
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

    // 3. Guardamos la captura con un TTL de 5 minutos (300 segundos) para mitigar carga
    await redis.set(cacheKey, JSON.stringify(rows), 'EX', 300);

    return NextResponse.json(rows, { 
      status: 200, 
      headers: { 'X-Cache': 'MISS' } 
    });
  } catch (error: any) {
    console.error("REDIS/PG ERROR:", error);
    return NextResponse.json({ error: 'Operacion Fallo.', detail: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Simulacion de aplicar vacuna: Agrega el registro y luego invalida la cache.
  try {
    const data = await req.json();
    const { mascota_id, vacuna_id, veterinario_id, costo_cobrado, rol } = data;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const dbRole = rol === 'admin' ? 'rol_admin' : (rol === 'veterinario' ? 'rol_veterinario' : 'rol_recepcion');
      await client.query(`SET LOCAL ROLE ${dbRole};`);
      
      if (rol === 'veterinario') {
         await client.query(`SET LOCAL app.current_vet_id = '${parseInt(veterinario_id, 10)}';`);
      }

      // Hardening Preventivo
      const query = `
         INSERT INTO vacunas_aplicadas (mascota_id, vacuna_id, veterinario_id, costo_cobrado)
         VALUES ($1, $2, $3, $4) RETURNING id;
      `;
      // driver PG previene injection
      await client.query(query, [mascota_id, vacuna_id, veterinario_id, costo_cobrado]);
      await client.query('COMMIT');
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

    // INVALIDACION DE CACHE PURA
    const cacheKey = 'vacunacion_pendientes_cache';
    await redis.del(cacheKey);
    console.log('🔥 Redis INVALIDATE: Cache purgado debido a nueva insercion');

    return NextResponse.json({ message: 'Vacuna aplicada y cache invalidada.' }, { status: 201 });
  } catch (error: any) {
    console.error("VACUNA ERROR:", error);
    return NextResponse.json({ error: 'Fallo al aplicar vacuna.', detail: error.message }, { status: 500 });
  }
}
