import assert from 'node:assert/strict';
import {sql,type PostgresAdapter} from '@payloadcms/db-postgres';
import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { projects,news,homepage } from '../src/data/homepage';
import {content} from '../src/data/content';
import {contact,sampleReview} from '../src/data/contact';
import {testimonials} from '../src/data/ui';
nextEnv.loadEnvConfig(process.cwd());
const {getPayload}=await import('payload');const {default:config}=await import('../payload.config');const payload=await getPayload({config});
try{
 for(const [collection,expected] of [['media',8],['project-categories',4],['projects',5],['news',3],['slides',4],['statistics',4],['testimonials',2]] as const){
  const rows=await payload.find({collection,limit:100,depth:0,overrideAccess:true,locale:'ka'});assert.equal(rows.totalDocs,expected);assert.equal(new Set(rows.docs.map(d=>d.sourceKey)).size,expected);
 }
 for(const p of projects){const row=(await payload.find({collection:'projects',where:{slug:{equals:p.id}},overrideAccess:true,depth:0})).docs[0];assert.equal(row.title,p.name.ka);assert.equal(row.summary,p.description.ka);assert.equal(row.status,p.statusCode);assert.equal(row.progress??null,'progress' in p?p.progress:null);assert.equal(row.progressVerified,false);assert.equal(row._status,'published');assert.equal(row.gallery?.length,1);}
 for(const n of news){const row=(await payload.find({collection:'news',where:{slug:{equals:n.id}},overrideAccess:true})).docs[0];assert.equal(row.title,n.title.ka);assert.equal(row.summary,n.body.ka);assert.equal(row.publishedAt,`${n.date}T00:00:00.000Z`);const english=await payload.findByID({collection:'news',id:row.id,locale:'en',fallbackLocale:'ka',overrideAccess:true});assert.equal(english.title,n.title.ka);}
 const about=await payload.findGlobal({slug:'about',overrideAccess:true});const source=await readFile('src/app/(frontend)/about/page.tsx','utf8');const tree=ts.createSourceFile('about.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let original:string[]=[];function walk(n:ts.Node){if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='paragraphs'&&n.initializer&&ts.isArrayLiteralExpression(n.initializer))original=n.initializer.elements.map(e=>(e as ts.StringLiteral).text);ts.forEachChild(n,walk);}walk(tree);assert.deepEqual(about.paragraphs?.map(p=>p.text),original);
 const settings=await payload.findGlobal({slug:'site-settings',overrideAccess:true,depth:0});assert.equal(settings.companyName,content.ka.company);assert.equal(settings.email,contact.email);assert.equal(settings.address,contact.address);
 const stats=await payload.find({collection:'statistics',sort:'order',overrideAccess:true});assert.deepEqual(stats.docs.map(x=>x.value),homepage.metrics.map(x=>Number(x[0])));
 const quotes=await payload.find({collection:'testimonials',sort:'order',overrideAccess:true});assert.deepEqual(quotes.docs.map(x=>x.quote),[sampleReview,testimonials.ka.quotes[1]]);assert.ok(quotes.docs.every(x=>x.illustrative));
 const media=await payload.find({collection:'media',limit:100,overrideAccess:true});for(const m of media.docs){const bytes=await readFile(m.sourceKey!);assert.equal(m.sourceHash,createHash('sha256').update(bytes).digest('hex'));assert.ok(m.url);if(m.width && m.width>=400 && m.height && m.height>=300)assert.ok(m.sizes?.thumbnail?.url);}
 const inventory=JSON.parse(await readFile('docs/CMS_SOURCE_INVENTORY.json','utf8'));for(const entry of inventory.files){let file=entry.path;if(file.startsWith('src/app/')&&!file.includes('/api/')&&!['src/app/globals.css','src/app/icon.png','src/app/apple-icon.png'].includes(file))file=file.replace('src/app/','src/app/(frontend)/');if(entry.path==='src/app/layout.tsx')continue;assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),entry.sha256,`Public source changed: ${file}`);}
 const db=payload.db as unknown as PostgresAdapter;
 const columns=await db.drizzle.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='password'`);assert.equal(columns.rows.length,0);
 const hashes=await db.drizzle.execute(sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE hash IS NOT NULL AND salt IS NOT NULL)::int AS hashed FROM users`);assert.equal(hashes.rows[0].total,hashes.rows[0].hashed);
 const tables=await db.drizzle.execute(sql`SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`);console.log('Database tables:',tables.rows[0].count,'; passwords use native salt/hash and no plaintext password column.');
 console.log('PASS imported record counts, unique keys, slugs, dates, statuses, progress, exact About paragraphs, fallback language, counters, demo testimonials, media hashes/thumbnails and preserved public sources.');
}finally{await payload.destroy();}
process.exit(0);
