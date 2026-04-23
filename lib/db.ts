import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Max clients in the pool
  idleTimeoutMillis: 30000,
});

export default pool;
