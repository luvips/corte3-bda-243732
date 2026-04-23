'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleVetActivo(id: number, current: boolean) {
    // Si desactivas, su panel en el Login no lo dejará entrar (regla cumplida)
    await pool.query('UPDATE veterinarios SET activo = $1 WHERE id = $2', [!current, id]);
    revalidatePath('/admin');
}

export async function updateDiasDescanso(id: number, dias: string) {
    await pool.query('UPDATE veterinarios SET dias_descanso = $1 WHERE id = $2', [dias, id]);
    revalidatePath('/admin');
}

export async function toggleMascotaEdit(id: number, dummyName: string) {
    // Placeholder para editar dueño/mascota rápido si se requiere demostración masiva
    await pool.query('UPDATE mascotas SET nombre = $1 WHERE id = $2', [dummyName, id]);
    revalidatePath('/admin');
}
