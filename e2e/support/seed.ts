import fs from 'node:fs';
import path from 'node:path';

export const SEED = JSON.parse(
  fs.readFileSync(path.resolve('server/db.seed.json'), 'utf-8'),
) as { users: { id: string }[]; roles: { id: string }[] };
