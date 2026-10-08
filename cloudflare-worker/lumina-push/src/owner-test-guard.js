import { DurableObject } from 'cloudflare:workers';

export class OwnerPushTestGuard extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS attempt (id INTEGER PRIMARY KEY CHECK (id=1))');
  }
  claim() {
    return this.ctx.storage.sql.exec('INSERT OR IGNORE INTO attempt (id) VALUES (1) RETURNING id').toArray().length === 1;
  }
}
