import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT id, nombre, activo, dias_descanso FROM veterinarios ORDER BY nombre ASC');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Fallo al obtener red médica' }, { status: 500 });
  }
}
