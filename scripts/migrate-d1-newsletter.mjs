import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const sqlPath = path.resolve('migrations/001_cc_newsletter.sql');
const rawSql = fs.readFileSync(sqlPath, 'utf8');

// Strip line comments
const cleanSql = rawSql
  .split('\n')
  .map(line => line.trim().startsWith('--') ? '' : line)
  .join('\n');

// Split statements by semicolon
const statements = cleanSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 5);

console.log(`[D1 Migration] Found ${statements.length} statements to execute.`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i].replace(/\s+/g, ' ');
  console.log(`[D1 Migration] Executing ${i + 1}/${statements.length}: ${stmt.substring(0, 60)}...`);
  
  // Escape double quotes for shell execution
  const escaped = stmt.replace(/"/g, '\\"');
  const cmd = `npx.cmd wrangler d1 execute mission-control-db --remote --command="${escaped}"`;
  
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (out.includes('ERROR')) {
      console.error(`Statement ${i + 1} output contained error:`, out);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Statement ${i + 1} failed:`, err.message);
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

console.log('[D1 Migration] All statements executed successfully on remote database!');
