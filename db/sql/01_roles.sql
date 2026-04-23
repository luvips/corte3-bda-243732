-- =============================================================
-- ROLES Y PERMISOS - CLINICA VETERINARIA
-- Corte 3 - Base de Datos Avanzadas - UP Chiapas
-- =============================================================

-- Eliminar roles existentes para permitir re-ejecucion limpia
DROP ROLE IF EXISTS rol_veterinario;
DROP ROLE IF EXISTS rol_recepcion;
DROP ROLE IF EXISTS rol_admin;

-- Crear roles sin privilegios de login (solo para SET ROLE)
CREATE ROLE rol_veterinario;
CREATE ROLE rol_recepcion;
CREATE ROLE rol_admin;

-- =============================================================
-- DENY BY DEFAULT: revocar cualquier permiso heredado
-- =============================================================
REVOKE ALL ON SCHEMA public FROM rol_veterinario;
REVOKE ALL ON SCHEMA public FROM rol_recepcion;
REVOKE ALL ON SCHEMA public FROM rol_admin;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_veterinario;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_recepcion;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rol_admin;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM rol_veterinario;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM rol_recepcion;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM rol_admin;

-- app_user no debe tener permisos directos sobre datos.
REVOKE ALL ON SCHEMA public FROM app_user;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM app_user;

-- =============================================================
-- ROL_VETERINARIO
-- =============================================================
GRANT USAGE ON SCHEMA public TO rol_veterinario;

GRANT SELECT ON mascotas TO rol_veterinario;
GRANT SELECT ON duenos TO rol_veterinario;
GRANT SELECT ON veterinarios TO rol_veterinario;
GRANT SELECT ON citas TO rol_veterinario;
GRANT SELECT ON vacunas_aplicadas TO rol_veterinario;
GRANT SELECT ON inventario_vacunas TO rol_veterinario;
GRANT SELECT ON vet_atiende_mascota TO rol_veterinario;

GRANT INSERT ON citas TO rol_veterinario;
GRANT INSERT ON vacunas_aplicadas TO rol_veterinario;

GRANT USAGE ON SEQUENCE citas_id_seq TO rol_veterinario;
GRANT USAGE ON SEQUENCE vacunas_aplicadas_id_seq TO rol_veterinario;

-- =============================================================
-- ROL_RECEPCION
-- =============================================================
GRANT USAGE ON SCHEMA public TO rol_recepcion;

GRANT SELECT ON mascotas TO rol_recepcion;
GRANT SELECT ON duenos TO rol_recepcion;
GRANT SELECT ON veterinarios TO rol_recepcion;
GRANT SELECT ON citas TO rol_recepcion;

GRANT INSERT ON citas TO rol_recepcion;

GRANT USAGE ON SEQUENCE citas_id_seq TO rol_recepcion;

-- =============================================================
-- ROL_ADMIN
-- =============================================================
GRANT USAGE ON SCHEMA public TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

-- =============================================================
-- CAMBIO DE ROL PARA app_user
-- =============================================================
GRANT rol_veterinario TO app_user;
GRANT rol_recepcion TO app_user;
GRANT rol_admin TO app_user;

-- =============================================================
-- JUSTIFICACION DE PERMISOS
-- =============================================================
-- 1) Deny-by-default reduce superficie de ataque: se revoca todo primero.
-- 2) rol_veterinario y rol_recepcion reciben solo lectura/escritura minima
--    para operar citas y consulta de pacientes.
-- 3) rol_admin tiene DML completo, pero no privilegios DDL (ALTER/DROP).
-- 4) app_user no toca tablas directamente; solo opera via SET ROLE.
