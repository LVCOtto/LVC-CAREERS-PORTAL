import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const tables = [
  "users",
  "job_roles",
  "departments",
  "competency_categories",
  "competency_items",
  "induction_template_items",
  "training_matrix_submissions",
  "user_certificates",
  "career_milestones",
  "resources",
  "certificate_definitions",
  "standards_survey_roles",
];
for (const t of tables) {
  try {
    const r = await pool.query(`select count(*)::int as c from ${t}`);
    console.log(t.padEnd(32), r.rows[0].c);
  } catch (e) {
    console.log(t.padEnd(32), "ERR", e.message);
  }
}
await pool.end();
