import assert from 'node:assert/strict';import nextEnv from '@next/env';import {readFile,readdir} from 'node:fs/promises';nextEnv.loadEnvConfig(process.cwd());const {Client}=await import('pg');const db=new Client({connectionString:process.env.DATABASE_URL});await db.connect();
try{const file=(await readdir('.cms-backups')).filter(f=>f.startsWith('phase44-')&&f.endsWith('-before.json')).sort().at(-1)!;assert.ok(file);const before=JSON.parse(await readFile('.cms-backups/'+file,'utf8'));let checked=0;
for(const [table,rows] of Object.entries(before) as [string,any[]][]){if(table.startsWith('payload_')||table==='users_sessions')continue;const current=(await db.query(`select * from "${table}" order by 1`)).rows;if(table!=='audit_logs')assert.equal(current.length,rows.length,table+' row count');
for(const old of rows){const row=current.find(r=>r.id===old.id);assert.ok(row,table+' original ID '+old.id);for(const [key,value] of Object.entries(old)){if(table==='users'&&['updated_at','login_attempts','lock_until','session_policies'].includes(key))continue;assert.deepEqual(JSON.parse(JSON.stringify(row[key])),value,table+'.'+key);checked++;}}
}
console.log('PASS '+checked+' original values: all real content, translations, IDs, slugs, media, user roles/credentials and current Settings/history unchanged');
}finally{await db.end();}
