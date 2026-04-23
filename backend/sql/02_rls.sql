-- =============================================================
-- ROW LEVEL SECURITY - CLINICA VETERINARIA
-- Corte 3 - Base de Datos Avanzadas - UP Chiapas
--
-- Se usa current_setting('app.current_vet_id', true) para recibir
-- el vet_id desde la aplicacion. El segundo parametro true evita
-- error si no existe la variable y devuelve NULL (falla segura).
-- =============================================================

ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- LIMPIEZA DE POLITICAS (idempotente)
-- =============================================================
DROP POLICY IF EXISTS veterinario_solo_sus_mascotas ON mascotas;
DROP POLICY IF EXISTS recepcion_todas_las_mascotas ON mascotas;
DROP POLICY IF EXISTS admin_acceso_total ON mascotas;

-- =============================================================
-- VETERINARIO: solo mascotas asignadas y activas
-- =============================================================
CREATE POLICY veterinario_solo_sus_mascotas ON mascotas
    FOR SELECT
    TO rol_veterinario
    USING (
        id IN (
            SELECT mascota_id
            FROM vet_atiende_mascota
            WHERE vet_id = current_setting('app.current_vet_id', true)::INT
            AND activa = TRUE
        )
    );

-- =============================================================
-- RECEPCION: acceso de lectura total
-- =============================================================
CREATE POLICY recepcion_todas_las_mascotas ON mascotas
    FOR SELECT
    TO rol_recepcion
    USING (true);

-- =============================================================
-- ADMIN: acceso total
-- =============================================================
CREATE POLICY admin_acceso_total ON mascotas
    FOR ALL
    TO rol_admin
    USING (true)
    WITH CHECK (true);

-- =============================================================
-- COMANDOS DE VERIFICACION (manuales en psql)
-- =============================================================

-- Test 1: vet_id=1 (Dr. Lopez) debe ver 3 mascotas
-- SET ROLE rol_veterinario;
-- SELECT set_config('app.current_vet_id', '1', false);
-- SELECT id, nombre FROM mascotas;

-- Test 2: recepcion debe ver todas (10)
-- SET ROLE rol_recepcion;
-- SELECT id, nombre FROM mascotas;

-- Test 3: admin debe ver todas (10)
-- SET ROLE rol_admin;
-- SELECT id, nombre FROM mascotas;

-- Test 4: verificar que RLS esta activo
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname = 'mascotas';
