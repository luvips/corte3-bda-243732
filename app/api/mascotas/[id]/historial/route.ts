import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const rol = searchParams.get('rol');
  const vetIdStr = searchParams.get('vet_id');
  const mascota_id = parseInt(params.id, 10);

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Mismo set de RLS (Para proteger la lectura de la vista si fuera cruzada)
    const dbRole = rol === 'admin' ? 'rol_admin' : (rol === 'veterinario' ? 'rol_veterinario' : 'rol_recepcion');
    await client.query(`SET LOCAL ROLE ${dbRole};`);
    if (rol === 'veterinario' && vetIdStr) {
      await client.query(`SET LOCAL app.current_vet_id = '${parseInt(vetIdStr, 10)}';`);
    }

    // Buscamos movimientos especificos. Hardening parametrizado ($1)
    const query = `
        SELECT h.* 
        FROM historial_movimientos h
        JOIN citas c ON h.referencia_id = c.id
        WHERE c.mascota_id = $1
        ORDER BY h.fecha DESC
    `;
    
    const { rows } = await client.query(query, [mascota_id]);
    await client.query('COMMIT');
    
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Fallo visualizacion historial', detail: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
