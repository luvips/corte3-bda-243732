-- =============================================================
-- PROCEDURES Y FUNCIONES - CLINICA VETERINARIA
-- Corte 3 - Base de Datos Avanzadas - UP Chiapas
-- =============================================================

-- =============================================================
-- Helper: valida si un veterinario esta disponible una fecha.
-- Devuelve TRUE cuando el vet existe, esta activo y no descansa
-- el dia indicado.
-- =============================================================
CREATE OR REPLACE FUNCTION fn_veterinario_disponible(
    p_vet_id INT,
    p_fecha  DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_dias_descanso VARCHAR(50);
    v_dia_semana    TEXT;
BEGIN
    IF p_vet_id IS NULL OR p_fecha IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT dias_descanso
    INTO v_dias_descanso
    FROM veterinarios
    WHERE id = p_vet_id
      AND activo = TRUE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    v_dia_semana := LOWER(TRIM(TO_CHAR(p_fecha, 'day')));

    IF COALESCE(v_dias_descanso, '') = '' THEN
        RETURN TRUE;
    END IF;

    RETURN POSITION(v_dia_semana IN LOWER(REPLACE(v_dias_descanso, ' ', ''))) = 0;
END;
$$;

-- =============================================================
-- Procedure endurecido para agendar cita.
-- No usa SQL dinamico: todas las consultas usan variables PL/pgSQL,
-- que PostgreSQL trata de forma segura (equivalente a prepared values).
-- =============================================================
CREATE OR REPLACE PROCEDURE sp_agendar_cita(
    IN  p_mascota_id     INT,
    IN  p_veterinario_id INT,
    IN  p_fecha_hora     TIMESTAMP,
    IN  p_motivo         TEXT,
    OUT p_cita_id        INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_dias_descanso VARCHAR(50);
    v_dia_semana    TEXT;
    v_ya_ocupado    BOOLEAN;
BEGIN
    -- 1) Mascota valida y existente
    IF p_mascota_id IS NULL THEN
        RAISE EXCEPTION 'Mascota no encontrada';
    END IF;

    PERFORM 1
    FROM mascotas
    WHERE id = p_mascota_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mascota no encontrada';
    END IF;

    -- 2) Veterinario valido y activo
    IF p_veterinario_id IS NULL THEN
        RAISE EXCEPTION 'Veterinario no encontrado o inactivo';
    END IF;

    SELECT dias_descanso
    INTO v_dias_descanso
    FROM veterinarios
    WHERE id = p_veterinario_id
      AND activo = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Veterinario no encontrado o inactivo';
    END IF;

    -- 3) Fecha obligatoria y futura
    IF p_fecha_hora IS NULL OR p_fecha_hora <= NOW() THEN
        RAISE EXCEPTION 'La fecha de la cita debe ser futura';
    END IF;

    -- 4) El veterinario no debe descansar ese dia
    v_dia_semana := LOWER(TRIM(TO_CHAR(p_fecha_hora, 'day')));

    IF COALESCE(v_dias_descanso, '') <> ''
       AND POSITION(v_dia_semana IN LOWER(REPLACE(v_dias_descanso, ' ', ''))) > 0 THEN
        RAISE EXCEPTION 'El veterinario no trabaja ese dia';
    END IF;

    -- 5) No debe tener otra cita activa ese mismo dia
    SELECT EXISTS (
        SELECT 1
        FROM citas c
        WHERE c.veterinario_id = p_veterinario_id
          AND DATE_TRUNC('day', c.fecha_hora) = DATE_TRUNC('day', p_fecha_hora)
          AND c.estado <> 'CANCELADA'
    )
    INTO v_ya_ocupado;

    IF v_ya_ocupado THEN
        RAISE EXCEPTION 'El veterinario ya tiene una cita ese dia';
    END IF;

    INSERT INTO citas (mascota_id, veterinario_id, fecha_hora, motivo, estado)
    VALUES (p_mascota_id, p_veterinario_id, p_fecha_hora, p_motivo, 'AGENDADA')
    RETURNING id INTO p_cita_id;
END;
$$;
