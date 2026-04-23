# KOTARO — Clínica Veterinaria · Corte 3

Sistema de gestión veterinaria construido con **Next.js 15**, **PostgreSQL** y **Redis**.

---

## Setup

```bash
# 1. Levantar base de datos y Redis
docker compose -f ../docker-compose.yml up -d

# 2. Cargar schema y datos
psql -h localhost -p 5441 -U admin -d clinica_vet -f backend/00_build_all.sql

# 3. Variables de entorno
cp .env.example .env  # completar credenciales

# 4. Iniciar app
npm install && npm run dev
```

---

## 1. Roles y permisos (GRANT / REVOKE)

Se crearon tres roles sin login, aplicando **deny-by-default**: se revoca todo antes de otorgar.

| Tabla | `rol_veterinario` | `rol_recepcion` | `rol_admin` |
|---|---|---|---|
| `mascotas` | SELECT | SELECT | ALL |
| `duenos` | SELECT | SELECT | ALL |
| `veterinarios` | SELECT | SELECT | ALL |
| `citas` | SELECT, INSERT | SELECT, INSERT | ALL |
| `vacunas_aplicadas` | SELECT, INSERT | — | ALL |
| `inventario_vacunas` | SELECT | — | ALL |
| `vet_atiende_mascota` | SELECT | — | ALL |

**Justificación:**
- `rol_recepcion` no recibe acceso a `vacunas_aplicadas` ni `inventario_vacunas` porque son datos médicos fuera de su responsabilidad.
- `rol_veterinario` solo puede INSERT en `citas` y `vacunas_aplicadas`, no UPDATE/DELETE, para preservar el historial clínico.
- `rol_admin` tiene DML completo pero no DDL (no puede hacer ALTER/DROP); los cambios estructurales solo los hace el superuser de mantenimiento.
- `app_user` es el usuario de conexión del backend. No toca tablas directamente; opera con `SET LOCAL ROLE` por transacción. Tiene los tres roles asignados para poder asumir cualquiera según la sesión.

---

## 2. Row Level Security (RLS)

Se habilitó RLS en la tabla `mascotas` (la tabla sensible central).

**Mecanismo elegido: `current_setting('app.current_vet_id', true)`**

El backend inyecta el identificador del veterinario como variable GUC de sesión antes de cada query:

```sql
SET LOCAL app.current_vet_id = '<vet_id_validado>';
```

Se eligió este mecanismo sobre alternativas como pasar el vet_id directo en la query o usar funciones `CURRENT_USER` porque:
- `SET LOCAL` aplica solo durante la transacción activa; al hacer `COMMIT` o liberar la conexión al pool, el valor desaparece automáticamente (falla segura).
- El GUC se configura **después** de `SET LOCAL ROLE`, por lo que cualquier política que lo lea ya opera bajo el rol restringido.
- La alternativa de usar `CURRENT_USER` no aplica porque `app_user` es único para toda la app; no hay un usuario de BD por veterinario.

**Políticas definidas:**

```sql
-- Veterinario: solo sus mascotas activas vía vet_atiende_mascota
CREATE POLICY veterinario_solo_sus_mascotas ON mascotas
    FOR SELECT TO rol_veterinario
    USING (id IN (
        SELECT mascota_id FROM vet_atiende_mascota
        WHERE vet_id = current_setting('app.current_vet_id', true)::INT
          AND activa = TRUE
    ));

-- Recepción: lectura total (no necesita filtro por vet)
CREATE POLICY recepcion_todas_las_mascotas ON mascotas
    FOR SELECT TO rol_recepcion USING (true);

-- Admin: acceso completo
CREATE POLICY admin_acceso_total ON mascotas
    FOR ALL TO rol_admin USING (true) WITH CHECK (true);
```

---

## 3. Hardening contra SQL Injection

**En el backend Next.js (driver `pg`):**

Todas las queries que reciben input del usuario usan prepared statements mediante el array `params` del driver:

```ts
// Correcto: el driver separa la query del valor y PostgreSQL los compila por separado
const query = `SELECT ... WHERE m.nombre ILIKE $1`;
await client.query(query, [`%${searchTerm}%`]);

// Nunca:
// `SELECT ... WHERE nombre = '${input}'`  ← vulnerable a UNION/DROP injection
```

El driver `pg` envía query y parámetros en mensajes de protocolo separados (Parse + Bind). PostgreSQL compila el plan sin los valores, luego los vincula; ningún carácter del input puede alterar la estructura del SQL.

**En el procedure `sp_agendar_cita`:**

No usa SQL dinámico (`EXECUTE` / `FORMAT`). Todas las referencias a tablas y columnas son literales en el código PL/pgSQL. Las variables de usuario (`p_mascota_id`, `p_veterinario_id`, etc.) se usan exclusivamente como valores en cláusulas `WHERE`, `INSERT` y comparaciones, por lo que PostgreSQL nunca las interpreta como identificadores.

**Hardening adicional en `SET LOCAL ROLE`:**

El nombre del rol se construye en el backend con un mapa fijo (nunca concatenando input del usuario):

```ts
const dbRole = rol === 'admin' ? 'rol_admin'
             : rol === 'recepcion' ? 'rol_recepcion'
             : 'rol_veterinario';
await client.query(`SET LOCAL ROLE ${dbRole};`);
```

El `vet_id` se parsea con `parseInt` antes de inyectarlo como GUC, descartando cualquier contenido no numérico.

---

## 4. Caché Redis sobre `v_mascotas_vacunacion_pendiente`

**Estrategia: Cache-Aside con invalidación activa**

| Parámetro | Decisión |
|---|---|
| **Key** | `vacunacion_pendientes_cache` |
| **TTL** | 300 segundos (5 minutos) |
| **Invalidación** | `DEL` inmediato al insertar en `vacunas_aplicadas` |

**Por qué 300 s:**
La vista agrega datos de toda la clínica y es costosa de recalcular. Un stock desactualizado 5 minutos no tiene impacto clínico (las vacunas no se agotan en segundos). TTL mayor aumentaría el riesgo de mostrar stock incorrecto; menor TTL eliminaría el beneficio del caché.

**Flujo GET:**
1. Buscar key en Redis.
2. Si existe (`HIT`) → retornar JSON directamente, sin tocar PostgreSQL.
3. Si no existe (`MISS`) → consultar PostgreSQL con `SET LOCAL ROLE` del rol activo, guardar resultado en Redis con TTL.

**Flujo POST (aplicar vacuna):**
1. Insertar en `vacunas_aplicadas` (PostgreSQL).
2. Hacer `DEL vacunacion_pendientes_cache` en Redis.
3. La siguiente petición GET generará un MISS y recargará datos frescos.

Se eligió **invalidación activa** sobre esperar el TTL porque aplicar una vacuna es el evento que cambia exactamente los datos que la vista calcula; no tiene sentido mostrar la mascota como "pendiente" después de que el veterinario ya aplicó la vacuna.
