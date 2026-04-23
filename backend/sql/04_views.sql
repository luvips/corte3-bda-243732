-- =============================================================
-- VISTAS - CLINICA VETERINARIA
-- Corte 3 - Base de Datos Avanzadas - UP Chiapas
-- =============================================================

DROP VIEW IF EXISTS v_mascotas_vacunacion_pendiente CASCADE;

CREATE VIEW v_mascotas_vacunacion_pendiente AS
WITH ultima_aplicacion AS (
    SELECT
        va.mascota_id,
        va.vacuna_id,
        MAX(va.fecha_aplicacion) AS ultima_fecha
    FROM vacunas_aplicadas va
    GROUP BY va.mascota_id, va.vacuna_id
)
SELECT
    m.id AS mascota_id,
    m.nombre AS mascota_nombre,
    m.especie,
    d.nombre AS dueno_nombre,
    d.telefono AS dueno_telefono,
    iv.nombre AS vacuna_nombre,
    iv.stock_actual
FROM mascotas m
JOIN duenos d
    ON d.id = m.dueno_id
CROSS JOIN inventario_vacunas iv
LEFT JOIN ultima_aplicacion ua
    ON ua.mascota_id = m.id
   AND ua.vacuna_id = iv.id
WHERE ua.ultima_fecha IS NULL
   OR (CURRENT_DATE - ua.ultima_fecha) > 365
ORDER BY m.nombre, iv.nombre;

-- Prueba manual sugerida:
-- SELECT COUNT(*) FROM v_mascotas_vacunacion_pendiente;
-- SELECT * FROM v_mascotas_vacunacion_pendiente LIMIT 20;
