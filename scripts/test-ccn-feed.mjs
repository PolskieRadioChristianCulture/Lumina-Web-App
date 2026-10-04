import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const source=fileURLToPath(new URL('../portals/ccn-news/',import.meta.url));
const result=spawnSync(process.execPath,[path.join(source,'node_modules/tsx/dist/cli.mjs'),'--test','scripts/ccn-public-feed.test.ts','scripts/ccn-bookmarks.test.ts'],{cwd:source,stdio:'inherit'});
process.exitCode=result.status || 0;
