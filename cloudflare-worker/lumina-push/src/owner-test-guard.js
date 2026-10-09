import { DurableObject } from 'cloudflare:workers';

export class OwnerPushTestGuard extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS attempt (id INTEGER PRIMARY KEY CHECK (id=1))');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS course_state (id INTEGER PRIMARY KEY CHECK (id=1), data TEXT, revision TEXT NOT NULL)');
  }
  claim() {
    return this.ctx.storage.sql.exec('INSERT OR IGNORE INTO attempt (id) VALUES (1) RETURNING id').toArray().length === 1;
  }
  // Separate deterministic objects are used for each course account and cursor.
  // No await between the read and conditional write: SQLite provides the CAS.
  courseRead(seed) {
    if (seed !== undefined) this.ctx.storage.sql.exec(
      'INSERT OR IGNORE INTO course_state (id,data,revision) VALUES (1,?,?)',
      seed === null ? null : JSON.stringify(seed), crypto.randomUUID());
    const row = this.ctx.storage.sql.exec('SELECT data,revision FROM course_state WHERE id=1').toArray()[0];
    return row ? {initialized:true,record:row.data === null ? null : {data:JSON.parse(row.data),revision:row.revision}} : {initialized:false};
  }
  courseSave(data, revision) {
    const row = this.ctx.storage.sql.exec('SELECT data,revision FROM course_state WHERE id=1').toArray()[0];
    if (!row || (revision ? row.data === null || row.revision !== revision : row.data !== null)) return false;
    const merged = {...(row.data === null ? {} : JSON.parse(row.data)),...data};
    return this.ctx.storage.sql.exec('UPDATE course_state SET data=?,revision=? WHERE id=1 AND revision=? RETURNING id',
      JSON.stringify(merged),crypto.randomUUID(),row.revision).toArray().length === 1;
  }
  courseRemove(revision) {
    const row = this.ctx.storage.sql.exec('SELECT data,revision FROM course_state WHERE id=1').toArray()[0];
    if (!row || (revision && (row.data === null || row.revision !== revision))) return false;
    this.ctx.storage.sql.exec('UPDATE course_state SET data=NULL,revision=? WHERE id=1',crypto.randomUUID());
    return true; // Tombstone prevents an old KV snapshot from re-enrolling anyone.
  }
}
