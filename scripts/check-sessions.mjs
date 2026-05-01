import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const tables = await p.query(`
  select table_name from information_schema.tables
  where table_schema = 'public'
  order by table_name
`);
console.log("All tables:");
for (const r of tables.rows) console.log("  ", r.table_name);

try {
  const sess = await p.query(`select count(*)::int as c, max(expire) as max_expire from user_sessions`);
  console.log("\nuser_sessions rows:", sess.rows[0]);
} catch (e) {
  console.log("\nuser_sessions table missing or error:", e.message);
}
await p.end();
