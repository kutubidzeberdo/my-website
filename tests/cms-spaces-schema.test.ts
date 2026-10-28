import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {migrations} from '../src/cms/migrations';
import {getStorageFilePath} from '@payloadcms/plugin-cloud-storage/utilities';

export const originalMigrations=['20261027_081756_initial_cms','20261027_092030_admin_editor_and_session_policy','20261027_112506_phase42_live_content','20261028_083709_phase43_optional_english','20261028_131818_phase47_card_images'];
const name='20261028_150352_spaces_object_key';
const previousPath='src/cms/migrations/20261028_131818_phase47_card_images.json';
const nextPath='src/cms/migrations/'+name+'.json';
function probe(mode:'local'|'s3'){
 const result=spawnSync(process.execPath,['--import','tsx','tests/helpers/cms-spaces-schema-probe.ts',mode],{encoding:'utf8',env:{...process.env,TSX_DISABLE_CACHE:'1',NEXT_TELEMETRY_DISABLED:'1'},timeout:60000});
 assert.equal(result.status,0,result.stderr||result.stdout);
 return JSON.parse(result.stdout.trim().split('\n').at(-1)!);
}

test('registered migration leaves the original five entries in order and adds only nullable varchar',async()=>{
 assert.deepEqual(migrations.slice(0,5).map(m=>m.name),originalMigrations);
 assert.equal(migrations[5].name,name);
 const previous=JSON.parse(await readFile(previousPath,'utf8'));
 const next=JSON.parse(await readFile(nextPath,'utf8'));
 assert.deepEqual(next.tables['public.media'].columns._objectkey,{name:'_objectkey',type:'varchar',primaryKey:false,notNull:false});
 delete next.tables['public.media'].columns._objectkey;next.id=previous.id;
 assert.deepEqual(next,previous,'snapshot differs only by the new column and snapshot ID');
 let sqlCalls=0;
 await assert.rejects(()=>migrations[5].down({db:{execute:()=>{sqlCalls++;}}} as any),/Refusing to drop media\._objectkey/);
 assert.equal(sqlCalls,0,'down cannot delete populated storage keys');
});

test('actual installed S3 schema requires exactly the migrated column; local schema stays unchanged',()=>{
 const local=probe('local'),s3=probe('s3');
 assert.equal(local.adapter,'local');assert.equal(local.disableLocalStorage,false);assert.equal(local.objectKeyField,null);
 assert.equal(s3.adapter,'s3');assert.equal(s3.disableLocalStorage,true);assert.equal(s3.hasStorageProxy,true);assert.equal(s3.accessRead,true);
 assert.deepEqual(s3.legacyURLs,local.legacyURLs,'main and derivative URLs retain the same-origin Payload proxy');assert.ok(s3.legacyURLs.every((url:string)=>new URL(url).pathname.startsWith('/api/media/file/')));
 assert.equal(s3.objectKeyField.name,'_objectKey');assert.equal(s3.objectKeyField.type,'text');assert.equal(s3.objectKeyField.admin.hidden,true);
 const objectKey=s3.tables.media.find((column:any)=>column.name==='_objectkey');
 assert.deepEqual(objectKey,{name:'_objectkey',type:'varchar',notNull:false,primaryKey:false,hasDefault:false});
 s3.tables.media=s3.tables.media.filter((column:any)=>column.name!=='_objectkey');
 assert.deepEqual(s3.tables,local.tables,'all other SQL columns are identical between storage modes');
});

test('native storage resolver preserves flat legacy original/derivative keys and supports new object folders',async()=>{
 for(const key of [undefined,null,''])for(const filename of ['legacy-photo.jpg','legacy-photo-400x300.jpg','legacy-photo-card-960x640.webp']){
  const result=await getStorageFilePath({collection:{slug:'media'} as any,collectionPrefix:'',doc:{id:1,filename:'legacy-photo.jpg',_objectKey:key} as any,filename,req:{} as any});
  assert.equal(result,filename);
 }
 assert.equal(await getStorageFilePath({collection:{slug:'media'} as any,collectionPrefix:'',doc:{id:1,_objectKey:'object-folder'},filename:'new-photo.jpg',req:{} as any}),'object-folder/new-photo.jpg');
});
