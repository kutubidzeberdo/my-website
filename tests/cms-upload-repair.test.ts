import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,rm,mkdtemp,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {Media,Projects,News} from '../src/cms/collections';
import {bilingualEditor} from '../src/cms/bilingual';
import {attachGalleryImages} from '../src/cms/gallery-upload';
import {mediaUploadOptions} from '../src/cms/upload-options';
import {processMultipartFormdata} from '../node_modules/payload/dist/uploads/fetchAPI-multipart/index.js';
import {unlinkTempFiles} from '../node_modules/payload/dist/uploads/unlinkTempFiles.js';

test('Native Media locale requests accept empty bilingual aliases while preserving other collection guards',async()=>{
 for(const locale of ['ka','en','all']){
 const copy={...Media,admin:{...Media.admin},fields:[...Media.fields],hooks:{...Media.hooks}};bilingualEditor(copy);
 const req:any={locale,context:{},i18n:{language:'ka'}};const data={bilingual_title:{ka:locale==='ka'?'ფოტო':null,en:locale==='en'?'Photo':null}};
 const args:any={data,req};for(const hook of copy.hooks!.beforeOperation!.slice(0,2))await hook({args,req,operation:'create',collection:copy} as any);
 assert.deepEqual(args.data.title,locale==='all'?{ka:null,en:null}:locale==='ka'?'ფოტო':'Photo');
 }
 for(const original of [Projects,News]){
 const copy={...original,admin:{...original.admin},fields:[...original.fields],hooks:{...original.hooks}};bilingualEditor(copy);
 const req:any={locale:'ka',context:{},i18n:{language:'ka'}};const args:any={data:{bilingual_title:{ka:'ტექსტი'}},req};
 const unwrap=copy.hooks!.beforeOperation!.find(hook=>hook!==copy.hooks!.beforeOperation![0])!;
 await assert.rejects(async()=>unwrap({args,req,operation:'create',collection:copy} as any),/locale=all/);
 }
});
test('Gallery batches append success IDs once, keep existing rows, and retry only missing relationships',()=>{
 const rows:any[]=[{id:'old',image:5},{id:'empty',image:null}];
 const args={path:'gallery.1.image',galleryPath:'gallery',schemaPath:'projects.gallery',getDataByPath:(p:string)=>p==='gallery'?rows:rows[1].image,setImage:(id:any)=>{rows[1].image=id;},addFieldRow:({rowIndex,subFieldState}:any)=>rows.splice(rowIndex,0,{image:subFieldState.image.value})};
 attachGalleryImages({...args,ids:[7,8,8,5]});assert.deepEqual(rows.map(r=>r.image),[5,7,8]);assert.equal(rows[0].id,'old');
 attachGalleryImages({...args,ids:[7,8,9]});assert.deepEqual(rows.map(r=>r.image),[5,7,8,9]);
 attachGalleryImages({...args,ids:[{relationTo:'media',value:10}]});assert.deepEqual(rows.map(r=>r.image),[5,7,8,9,10]);
});
test('Multipart originals larger than former 10/20/50 MB caps stream to disk and pass the actual image hook',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'pmc-upload-test-'));let file:any;
 try{
 const image=await sharp({create:{width:4,height:4,channels:3,background:'#abcdef'}}).png().toBuffer();const boundary='pmc-test';
 const chunks:Uint8Array[]=[Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="large-original.png"\r\nContent-Type: image/png\r\n\r\n`),image];
 const pad=Buffer.alloc(1024*1024);for(let i=0;i<51;i++)chunks.push(pad);chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));let index=0;
 const body=new ReadableStream({pull(controller){if(index<chunks.length)controller.enqueue(chunks[index++]);else controller.close();}});
 const request=new Request('http://upload-test.invalid/api/media',{method:'POST',headers:{'content-type':`multipart/form-data; boundary=${boundary}`},body,duplex:'half'} as any);
 const result=await processMultipartFormdata({request,options:{...mediaUploadOptions,tempFileDir:dir}} as any);assert.ok(!result.error,String(result.error));file=(result.files as any).file;
 assert.ok(file.size>50*1024*1024);assert.equal(file.data.length,0);assert.equal((await stat(file.tempFilePath)).size,file.size);
 const req:any={file,locale:'ka',context:{cmsImport:true}};const args:any={data:{},req};await Media.hooks!.beforeOperation![0]({req,args,operation:'create'} as any);
 assert.equal(args.data.title,'large-original');assert.equal(file.mimetype,'image/png');
 await unlinkTempFiles({collectionConfig:Media,config:{upload:mediaUploadOptions},req} as any);await assert.rejects(stat(file.tempFilePath),{code:'ENOENT'});
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Gallery extension uses native controls, removes duplicate batch controls, keeps featured images single',async()=>{
 const source=await readFile('src/cms/admin/BatchImages.tsx','utf8');assert.ok(source.includes('UploadInput'));assert.ok(source.includes('hasMany={!value}'));assert.ok(!source.includes('<button'));assert.ok(!source.includes('<input'));assert.ok(!source.includes('fetch('));
 assert.ok(!(await readFile('src/cms/collections.ts','utf8')).includes('MediaBatchImages'));
 const fields=await readFile('src/cms/fields.ts','utf8');assert.ok(fields.includes('BatchImages#GalleryImage'));assert.ok(!fields.includes("hasMany:true"));
});
test('Reported filenames upload through the Media hook chain with Georgian-only native form aliases',async()=>{
 const buffer=await sharp({create:{width:3,height:3,channels:3,background:'#ffffff'}}).jpeg().toBuffer();
 const copy={...Media,admin:{...Media.admin},fields:[...Media.fields],hooks:{...Media.hooks}};bilingualEditor(copy);
 for(const name of ['201138754_1439484456418731_160240318526518761_n.jpg','DJI_0021.jpg','stad.jpg','ფოტო.jpg']){
 const req:any={locale:'ka',context:{cmsImport:true},i18n:{language:'ka'},file:{name,mimetype:'image/jpeg',data:buffer,size:buffer.length}};
 let args:any={data:{bilingual_title:{ka:null,en:null}},req};
 for(const hook of copy.hooks!.beforeOperation!){const result=await hook({args,req,operation:'create',collection:{config:copy}} as any);if(result)args=result;}
 assert.equal(args.data.title,name.replace(/\.jpg$/,''));assert.equal(req.locale,'ka');
 }
});
