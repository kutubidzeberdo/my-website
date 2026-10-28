import assert from 'node:assert/strict';
import nextEnv from '@next/env';import {readFile,readdir} from 'node:fs/promises';
nextEnv.loadEnvConfig(process.cwd());
const {Client}=await import('pg');const db=new Client({connectionString:process.env.DATABASE_URL});await db.connect();
try{
 const backup=(await readdir('.cms-backups')).filter(f=>f.startsWith('phase43-')&&f.endsWith('-before.json')).sort().at(-1)!;const before=JSON.parse(await readFile('.cms-backups/'+backup,'utf8'));
 let values=0;for(const [table,rows] of Object.entries(before) as [string,any[]][]){if(['payload_migrations','payload_locked_documents','payload_locked_documents_rels','payload_preferences','payload_preferences_rels','users_sessions'].includes(table))continue;
 const current=(await db.query(`select * from "${table}" order by 1`)).rows;if(table.startsWith('_')||table.endsWith('_locales')||table==='audit_logs')assert.ok(current.length>=rows.length,table+' original rows');else assert.equal(current.length,rows.length,table+' count');
 for(const row of rows){const found=current.find(r=>table.endsWith('_locales')?r._parent_id===row._parent_id&&r._locale===row._locale:r.id===row.id);assert.ok(found,table+' ID');for(const [key,value] of Object.entries(row)){
 if(table.endsWith('_locales')&&key==='id')continue;
 if((table==='site_settings'||table==='users')&&['updated_at','login_attempts','lock_until'].includes(key))continue;
 if(key in found){assert.deepEqual(JSON.parse(JSON.stringify(found[key])),value,table+'.'+key);values++;}
 else {let target:any;if(table.endsWith('_locales'))target=(await db.query(`select "${key}" from "${table.slice(0,-8)}" where id=$1`,[row._parent_id])).rows[0];else target=(await db.query(`select "${key}" from "${table}_locales" where _parent_id=$1 and _locale='ka'`,[row.id])).rows[0];assert.deepEqual(target?.[key],value,table+'.'+key+' relocated');values++;}
 }} }
 console.log(`PASS ${values} original database values, record IDs, Georgian text, versions, relationships and relocated copy preserved`);
}finally{await db.end();}
const {getPayload,createLocalReq}=await import('payload');const {default:config}=await import('../payload.config');const p=await getPayload({config});
const body=(text:string)=>({root:{type:'root',format:'',indent:0,version:1,direction:null,children:[{type:'paragraph',format:'',indent:0,version:1,direction:null,children:[{type:'text',text,format:0,version:1,detail:0,mode:'normal',style:''}]}]}} as any);
const tx=await p.db.beginTransaction();assert.ok(tx);const user=(await p.find({collection:'users',where:{role:{equals:'super-admin'}},limit:1})).docs[0];
try{
 for(const collection of ['news','projects'] as const){const req=await createLocalReq({user,context:{cmsImport:true}},p);req.transactionID=tx;
 const ka=await p.create({collection,locale:'ka',req,data:{title:'საცდელი',slug:'phase43-'+collection,_status:'published',content:body('ქართული ტექსტი')}});
 await p.update({collection,id:ka.id,locale:'en',req,data:{title:'',content:body('')}});
 let all=await p.findByID({collection,id:ka.id,locale:'all',req});assert.equal((all.title as any).ka,'საცდელი');
 await p.update({collection,id:ka.id,locale:'en',req,data:{title:'English title',content:body('English article')}});
 await p.update({collection,id:ka.id,locale:'ka',req,data:{title:'ქართული სათაური'}});
 all=await p.findByID({collection,id:ka.id,locale:'all',req});assert.equal((all.title as any).en,'English title');assert.equal((all.title as any).ka,'ქართული სათაური');assert.equal((all.content as any).en.root.children[0].children[0].text,'English article');assert.equal((all.content as any).ka.root.children[0].children[0].text,'ქართული ტექსტი');assert.equal(all.slug,ka.slug);
 console.log('PASS '+collection+' optional English, separate title/Lexical edits, shared slug (transaction rolled back)');
 }
}finally{await p.db.rollbackTransaction(tx);await p.destroy();}
process.exit(0);
