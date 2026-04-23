# Cuaderno de Ataques y Pruebas - KOTARO

Este cuaderno documenta las pruebas destructivas y casos de abuso (MVS - Minimum Viable Security), evidenciando que los mecanismos implementados en el Corte 3 responden efectivamente.

## 1. Prevención de SQL Injection (Hardening Backend)

### Ataque Simulado (Segundo Orden / UNION-Based)
Al buscar un paciente, un atacante malintencionado podría enviar el siguiente payload en el campo de búsqueda:
`' UNION SELECT username, password FROM pg_shadow --`

**Comportamiento Dinámico Vulnerable:**
Si el backend usara interpolación de strings (`"SELECT * FROM mascotas WHERE nombre = '" + input + "'"`), el servidor devolvería las credenciales y comprometería la clínica.

**Nuestra Defensa (Implementada):**
Utilizamos Prepared Statements mediante el driver `pg` de NodeJS.
```javascript
const query = `... WHERE m.nombre ILIKE $1 OR m.especie ILIKE $1 ...`;
const params = [`%${searchTerm}%`];
await client.query(query, params);
```
**Resultado de la prueba:** La base de datos recibe el payload como un dato literal, no como código ejecutable. La base de datos responde pacíficamente: `[]` (Sin resultados para el paciente llamado `' UNION...`). SQLi neutralizado (Defensa Mencionada como #1 en las Diapositivas).

---

## 2. Row Level Security (RLS) - Violación de Datos Entrecruzados

### Caso de Prueba: Bypass de Veterinario
El sistema asigna al veterinario una sesión válida (`vet_id = 1`, Dr. López). El frontend es manipulado y el usuario intercepta la petición, intentando pedir la mascota `ID=9` (que le pertenece a otro doctor).

**Flujo Implementado:**
En el endpoint `GET /api/mascotas`, forzamos inmediatamente a nivel de motor de datos:
1. `SET LOCAL ROLE rol_veterinario;`
2. `SET LOCAL app.current_vet_id = '1';`

**Resultado de la prueba:**
La política restrictiva de RLS para `mascotas` filtra automáticamente la fila `ID=9`. De los 10 registros globales, la base de datos solo procesa y retorna a *Firulais(1), Toby(5) y Max(7)*. **Impacto:** Segregación confirmada, acceso no autorizado denegado por diseño.

---

## 3. Redis Caching & Cache-Aside Poisoning

### Escenario de Estrés
Generación de 1,000 peticiones concurrentes a la vista `v_mascotas_vacunacion_pendiente`.

**Flujo Implementado:**
Hacemos intersección mediante interceptación local: `redis.get('vacunacion_pendientes_cache')`. 
- Petición 1 incurre en un `MISS` (500ms de latencia en motor), pero lo guarda con TTL de 300 segundos.
- Peticiones 2 a 1,000 incurren en `HIT` desde memoria RAM (<10ms). La base de datos no recibe tráfico.
A su vez, al inyectar una nueva vacuna mediante `POST /api/vacunas`, ejecutamos `redis.del(...)`. Esto invalida correctamente el caché previniendo datos viciados (Stale Data).
