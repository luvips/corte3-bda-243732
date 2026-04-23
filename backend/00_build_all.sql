-- =============================================================
-- EJECUCION COMPLETA DE LA BASE DE DATOS - CORTE 3
-- Ejecutar con:
-- psql -h localhost -p 5441 -U admin -d clinica_vet -f 00_build_all.sql
-- =============================================================

\echo '1/5 Cargando schema base'
\ir sql/schema_corte3.sql

\echo '2/5 Creando roles y permisos'
\ir sql/01_roles.sql

\echo '3/5 Aplicando Row Level Security'
\ir sql/02_rls.sql

\echo '4/5 Creando procedures y funciones'
\ir sql/03_procedures.sql

\echo '5/5 Creando vistas'
\ir sql/04_views.sql

\echo 'Base de datos construida correctamente.'
