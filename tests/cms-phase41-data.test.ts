import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sql,type PostgresAdapter} from '@payloadcms/db-postgres';
nextEnv.loadEnvConfig(process.cwd());const {getPayload}=await import('payload');const {default:config}=await import('../payload.config');const payload=await getPayload({config});
try{
 const baseline=JSON.parse(await readFile('.cms-backups/phase4-1/content-before.json','utf8'));const db=payload.db as unknown as PostgresAdapter;
 for(const [table,rows] of Object.entries(baseline)){
  const result=await db.drizzle.execute(sql`SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) AS docs FROM ${sql.identifier(table)} t`);
  const normalize=(v:unknown)=>JSON.parse(JSON.stringify(v));const actual=normalize(result.rows[0].docs).map((r:Record<string,unknown>)=>{if(table==='about_locales')delete r.content;delete r.updated_at;return r;});
  const expected=normalize(rows).map((r:Record<string,unknown>)=>{if(table==='about_locales')delete r.content;delete r.updated_at;return r;});assert.deepEqual(actual,expected,`${table} saved content changed`);
 }
 const about=await payload.findGlobal({slug:'about',locale:'all',fallbackLocale:false,depth:0,overrideAccess:true});
 for(const saved of baseline.about_locales){const texts=baseline.about_paragraphs.sort((a:{_order:number},b:{_order:number})=>a._order-b._order).map((p:{id:string})=>baseline.about_paragraphs_locales.find((t:{_parent_id:string;_locale:string})=>t._parent_id===p.id&&t._locale===saved._locale)?.text).filter((v:unknown)=>v!==undefined);const content=(about.content as unknown as Record<string,{root:{children:{children:{text:string}[]}[]}}>)[saved._locale];assert.deepEqual(content.root.children.map(p=>p.children.map(t=>t.text).join('')),texts);}
 const fallback=await payload.findGlobal({slug:'about',locale:'en',fallbackLocale:'ka',depth:0,overrideAccess:true});const georgian=await payload.findGlobal({slug:'about',locale:'ka',fallbackLocale:false,depth:0,overrideAccess:true});assert.deepEqual(fallback.content,georgian.content,'Georgian fallback changed');
 const historical=await db.drizzle.execute(sql`SELECT a.version_content, jsonb_agg(l.text ORDER BY p._order) AS original FROM _about_v_locales a JOIN _about_v_version_paragraphs p ON p._parent_id=a._parent_id JOIN _about_v_version_paragraphs_locales l ON l._parent_id=p.id AND l._locale=a._locale GROUP BY a.id,a.version_content`);for(const row of historical.rows){const content=row.version_content as {root:{children:{children:{text:string}[]}[]}};assert.deepEqual(content.root.children.map(p=>p.children.map(t=>t.text).join('')),row.original,'Historical About wording changed');}
 const before=await db.drizzle.execute(sql`SELECT content FROM about_locales ORDER BY id`);
 const migration=await import('../src/cms/migrations/20261027_092030_admin_editor_and_session_policy');
 // Re-run the guarded UP in a transaction and roll it back: no persistent writes.
 await db.drizzle.transaction(async tx=>{await migration.up({db:tx,payload,req:undefined} as never);const after=await tx.execute(sql`SELECT content FROM about_locales ORDER BY id`);assert.deepEqual(after.rows,before.rows);throw new Error('phase41-test-rollback');}).catch(e=>{if(e.message!=='phase41-test-rollback')throw e;});
 const checksums=JSON.parse(await readFile('.cms-backups/phase4-1/public-and-env-checksums.json','utf8'));for(const [file,hash] of Object.entries(checksums))assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,`Protected file changed: ${file}`);
 console.log('PASS exact localized About conversion, retained legacy rows, all saved source content, repeat-safe migration, unchanged public files/Gmail and unchanged environment credentials.');
}finally{await payload.destroy();}
process.exit(0);
