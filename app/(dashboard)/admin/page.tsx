import { Suspense } from 'react';
import pool from '@/lib/db';
import { toggleVetActivo, updateDiasDescanso } from './actions';
import { Button } from '@/app/components/ui/button';

export const dynamic = 'force-dynamic';

async function VetsTable() {
    const { rows } = await pool.query('SELECT * FROM veterinarios ORDER BY id ASC');
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mantenimiento de Doctores</h2>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="p-3 text-sm font-semibold text-gray-600">ID / Cédula</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Nombre</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Días Descanso</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Estado</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Ajustar Toggles</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.map((vet: any) => (
                        <tr key={vet.id} className="hover:bg-gray-50/50">
                            <td className="p-3">
                                <span className="font-mono text-xs bg-gray-100 p-1 rounded">{vet.cedula}</span>
                            </td>
                            <td className="p-3 font-medium">{vet.nombre}</td>
                            <td className="p-3">
                                <form action={async (formData: FormData) => {
                                    'use server';
                                    const dias = formData.get('dias') as string;
                                    await updateDiasDescanso(vet.id, dias);
                                }} className="flex items-center gap-2">
                                    <input name="dias" defaultValue={vet.dias_descanso} className="border p-1 text-sm rounded w-32" />
                                    <button type="submit" className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Guardar</button>
                                </form>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${vet.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {vet.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="p-3">
                                <form action={async () => {
                                    'use server';
                                    await toggleVetActivo(vet.id, vet.activo);
                                }}>
                                    <Button size="sm" variant={vet.activo ? "destructive" : "default"} className="h-8 text-xs">
                                        {vet.activo ? 'Suspender' : 'Reactivar'}
                                    </Button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-4xl font-extrabold text-[#075985] mb-2 tracking-tight">Consola Administrativa</h1>
                <p className="text-lg text-gray-500 font-medium">Gestión de RH, Clínica y Mantenimiento a Base de Datos Central</p>
            </div>
            <Suspense fallback={<div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>}>
                <VetsTable />
            </Suspense>
        </div>
    );
}
