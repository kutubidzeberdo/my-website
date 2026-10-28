// Requires explicit approval: restore only missing original Settings history from the fresh backup.
// Current Settings, content, users, media and migration tables are never written.
import nextEnv from '@next/env';import {readFile,readdir} from 'node:fs/promises';nextEnv.loadEnvConfig(process.cwd());
const {Client}=await import('pg');const db=new Client({connectionString:process.env.DATABASE_URL});await db.connect();
try{
 const file=(await readdir('.cms-backups')).filter(f=>f.startsWith('phase43-')&&f.endsWith('-before.json')).sort().at(-1)!;
 const before=JSON.parse(await readFile('.cms-backups/'+file,'utf8'));const schema:Record<string,string[]>={};
 for(const r of (await db.query("select table_name,column_name from information_schema.columns where table_schema='public'")).rows)(schema[r.table_name]??=[]).push(r.column_name);
 const plan:Record<string,any[]>={};for(const [table,rows] of Object.entries(before) as [string,any[]][]){if(!table.startsWith('_site_settings_v'))continue;const ids=new Set((await db.query(`select id from "${table}"`)).rows.map(r=>r.id));plan[table]=rows.filter(r=>!ids.has(r.id));}
 console.log('Missing original history rows:',Object.fromEntries(Object.entries(plan).map(([t,r])=>[t,r.length])));
 if(process.argv[2]!=='--apply'){console.log('Read-only preview; --apply requires explicit approval.');process.exitCode=0;}
 else{
 await db.query('BEGIN');let restored=0;
 for(const [table,rows] of Object.entries(plan)){for(const row of rows){const entries=Object.entries(row).filter(([k])=>schema[table].includes(k));await db.query(`insert into "${table}" (${entries.map(([k])=>'"'+k+'"').join(',')}) values (${entries.map((_,i)=>'$'+(i+1)).join(',')})`,entries.map(([,v])=>v&&typeof v==='object'?JSON.stringify(v):v));restored++;}}
 for(const [table,rows] of Object.entries(plan)){for(const row of rows){for(const [key,value] of Object.entries(row)){if(schema[table].includes(key))continue;
 if(table.endsWith('_locales'))await db.query(`update "${table.slice(0,-8)}" set "${key}"=$1 where id=$2`,[value,row._parent_id]);
 else{const dest=table+'_locales';const existing=(await db.query(`select id from "${dest}" where _parent_id=$1 and _locale='ka'`,[row.id])).rows[0];if(existing)await db.query(`update "${dest}" set "${key}"=$1 where id=$2`,[value,existing.id]);else await db.query(`insert into "${dest}" ("${key}",_locale,_parent_id) values ($1,'ka',$2)`,[value,row.id]);}
 }}}
 // Assert every original version and nested row exists before committing.
 for(const [table,rows] of Object.entries(before) as [string,any[]][]){if(!table.startsWith('_site_settings_v'))continue;for(const row of rows){if(!(await db.query(`select id from "${table}" where id=$1`,[row.id])).rowCount)throw Error('Missing history row '+table);}}
 await db.query('COMMIT');console.log('Restored '+restored+' missing original history rows. Current records untouched.');
 }
}catch(e){await db.query('ROLLBACK');throw e;}finally{await db.end();}
