import { Pool } from 'pg';
import * as schema from '../shared/schema.js';
import { getTableColumns, getTableName } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const dbCols = await pool.query(`
  SELECT table_name, column_name
  FROM information_schema.columns
  WHERE table_schema='public'
`);

const dbMap = new Map<string, Set<string>>();
for (const r of dbCols.rows) {
  if (!dbMap.has(r.table_name)) dbMap.set(r.table_name, new Set());
  dbMap.get(r.table_name)!.add(r.column_name);
}

let missing = 0;
for (const [, table] of Object.entries(schema)) {
  if (!table || typeof table !== 'object' || !(Symbol.for('drizzle:Name') in (table as any))) continue;
  const tableName = getTableName(table as any);
  const cols = getTableColumns(table as any);
  const dbColsForTable = dbMap.get(tableName);
  if (!dbColsForTable) {
    console.log(`MISSING TABLE: ${tableName}`);
    missing++;
    continue;
  }
  for (const [, col] of Object.entries(cols)) {
    const colName = (col as any).name;
    if (!dbColsForTable.has(colName)) {
      console.log(`MISSING COLUMN: ${tableName}.${colName}`);
      missing++;
    }
  }
}
console.log(`\nTotal missing: ${missing}`);
await pool.end();
