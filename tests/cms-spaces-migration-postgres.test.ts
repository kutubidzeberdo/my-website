import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:net';
import {Client} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import {migrations} from '../src/cms/migrations';

// Uses its own temporary PostgreSQL cluster. Never reads DATABASE_URL/.env.local.
test('additive migration preserves five-migration data on a disposable PostgreSQL 17 cluster',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'pmc-spaces-pg-'));
 const data=path.join(root,'data'),socket=path.join(root,'socket');await mkdir(socket);
 const bin=process.env.PG_TEST_BIN_DIR||'/usr/local/opt/postgresql@17/bin';
 const pg=(command:string,args:string[])=>execFileSync(path.join(bin,command),args,{encoding:'utf8',stdio:'pipe'});
 const reservation=createServer();await new Promise<void>(resolve=>reservation.listen(0,'127.0.0.1',resolve));
 const port=(reservation.address() as {port:number}).port;await new Promise<void>((resolve,reject)=>reservation.close(error=>error?reject(error):resolve()));
 assert.notEqual(port,5433,'cannot use the real local database port');
 let running=false;let admin:Client|undefined;let client:Client|undefined;
 try{
  pg('initdb',['-D',data,'--auth=trust','-U','spaces_schema_test','--no-locale','--encoding=UTF8']);
  pg('pg_ctl',['-D',data,'-l',path.join(root,'postgres.log'),'-w','start','-o',`-h 127.0.0.1 -p ${port} -k ${socket}`]);running=true;
  admin=new Client({host:'127.0.0.1',port,user:'spaces_schema_test',database:'postgres'});await admin.connect();
  await admin.query('CREATE DATABASE pmc_spaces_schema_test');
  client=new Client({host:'127.0.0.1',port,user:'spaces_schema_test',database:'pmc_spaces_schema_test'});await client.connect();
  assert.equal((await client.query('select current_database() as name')).rows[0].name,'pmc_spaces_schema_test');
  const db=drizzle(client);
  for(const [index,migration]of migrations.slice(0,5).entries()){
   await client.query('BEGIN');try{await migration.up({db} as any);await client.query('insert into payload_migrations(name,batch) values($1,$2)',[migration.name,index+1]);await client.query('COMMIT');}catch(error){await client.query('ROLLBACK');throw error;}
  }
  await client.query(`INSERT INTO media(id,filename,url,mime_type,width,height,focal_x,focal_y,sizes_thumbnail_filename,sizes_thumbnail_url,sizes_card_filename,sizes_card_url,sizes_card_width,sizes_card_height) VALUES
   (1001,'legacy.jpg','/api/media/file/legacy.jpg','image/jpeg',1920,1280,50,50,'legacy-400x300.jpg','/api/media/file/legacy-400x300.jpg','legacy-card-960x640.webp','/api/media/file/legacy-card-960x640.webp',960,640),
   (1002,'small.webp','/api/media/file/small.webp','image/webp',256,236,15,80,NULL,NULL,NULL,NULL,NULL,NULL);
   INSERT INTO media_locales(id,_parent_id,_locale,title,alt,caption) VALUES
   (501,1001,'ka','ქართული','ფოტო','წარწერა'),(502,1001,'en','English','Photo','Caption');
   INSERT INTO news(id,slug,image_id,seo_image_id) VALUES(701,'legacy-news',1001,1002);
   INSERT INTO projects(id,slug,image_id) VALUES(702,'legacy-project',1001);
   INSERT INTO projects_gallery(id,_parent_id,_order,image_id) VALUES('legacy-gallery',702,1,1002);
   INSERT INTO projects_gallery_locales(_parent_id,_locale,caption,alt) VALUES('legacy-gallery','ka','გალერეა','ფოტო');`);
  const snapshot=async()=>{
   const state:Record<string,any[]>={};const tables=(await client!.query("select table_name from information_schema.tables where table_schema='public' order by table_name")).rows;
   for(const {table_name:name}of tables)state[name]=(await client!.query('select * from "'+name+'" order by 1')).rows;
   return state;
  };
  const before=await snapshot();assert.equal(before.payload_migrations.length,5);
  await client.query('BEGIN');try{await migrations[5].up({db} as any);await client.query('COMMIT');}catch(error){await client.query('ROLLBACK');throw error;}
  const column=(await client.query("select data_type,is_nullable,column_default,character_maximum_length from information_schema.columns where table_schema='public' and table_name='media' and column_name='_objectkey'")).rows;
  assert.deepEqual(column,[{data_type:'character varying',is_nullable:'YES',column_default:null,character_maximum_length:null}]);
  const after=await snapshot();for(const media of after.media){assert.equal(media._objectkey,null);delete media._objectkey;}
  assert.deepEqual(after,before,'all original rows, IDs, URLs, dimensions, derivatives, relations, locales and five ledger entries preserved');
  await client.query("UPDATE media SET _objectkey='future-object-folder' WHERE id=1001");
  await assert.rejects(()=>migrations[5].down({db} as any),/Refusing to drop/);
  assert.equal((await client.query('select _objectkey from media where id=1001')).rows[0]._objectkey,'future-object-folder');
  console.log('Isolated SQL verification passed; no connection to pmc_cms or port 5433.');
 }finally{
  await client?.end();await admin?.end();if(running)pg('pg_ctl',['-D',data,'-m','fast','-w','stop']);await rm(root,{recursive:true,force:true});
 }
});
