import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Projects,Media,News} from '../src/cms/collections';
import {bilingualEditor} from '../src/cms/bilingual';
import {gallery} from '../src/cms/fields';
import type {Field} from 'payload';
function flatten(fields:Field[]):any[]{return fields.flatMap(f=>[f,...('fields'in f?flatten(f.fields):[]),...(f.type==='tabs'?f.tabs.flatMap(t=>flatten(t.fields)):[])]);}
test('Project progress follows actual status without mutating data',()=>{for(const name of ['progress','progressPreview']){const field=flatten(Projects.fields).find(f=>f.name===name);for(const status of ['ongoing','completed','planned']){const data={status,progress:64};assert.equal(field.admin.condition(data,{}),status==='ongoing');assert.equal(data.progress,64);}}});
test('All requested metadata remains optional, media and gallery legacy values remain stored but hidden',()=>{for(const name of ['videoURL','location','phase','progressUpdatedAt','budget','contractor','client','investment','area','startDate','endDate'])assert.ok(!flatten(Projects.fields).find(f=>f.name===name).required,name);for(const collection of [Projects,News]){const seo=flatten(collection.fields).find(f=>f.name==='seo');for(const f of seo.fields)assert.ok(!f.required);}for(const name of ['alt','caption','filesize']){const f=flatten(Media.fields).find(f=>f.name===name);assert.equal(f.admin.hidden,true);assert.ok(!f.required);assert.ok(!f.validate);}const rows=flatten([gallery]);assert.equal(rows.find(f=>f.name==='alt').admin.hidden,true);assert.ok(!rows.find(f=>f.name==='caption').required);});
test('Bilingual adapter retains gallery upload control and optional English metadata',()=>{const copy=structuredCloneWithoutFunctions(Projects);bilingualEditor(copy);const all=flatten(copy.fields);for(const name of ['title','description','caption']){const alias=all.find(f=>f.name==='bilingual_'+name);assert.ok(alias);assert.equal(alias.fields.find((f:any)=>f.name==='en').required,false);}const row=all.find(f=>f.name==='gallery');assert.equal(row.admin.components.Field,'/src/cms/admin/BilingualFields#TranslationArray');});
function structuredCloneWithoutFunctions(value:any):any{if(Array.isArray(value))return value.map(structuredCloneWithoutFunctions);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,structuredCloneWithoutFunctions(v)]));return value;}
test('Actual Media upload hook derives Unicode titles and preserves explicit locale titles',async()=>{
 const sharp=(await import('sharp')).default;
 const buffer=await sharp({create:{width:2,height:2,channels:3,background:'#ffffff'}}).png().toBuffer();
 const hook=Media.hooks!.beforeOperation![0];
 async function upload(title:any,locale='ka',operation='create'){
  const args:any={data:title===undefined?{}:{title},req:{locale,context:{cmsImport:true},file:{name:'ბათუმის სტადიონი.png',mimetype:'image/png',size:buffer.length,data:buffer}}};
  await hook({req:args.req,args,operation,collection:Media} as any);return args;
 }
 assert.equal((await upload('')).data.title,'ბათუმის სტადიონი');
 assert.deepEqual((await upload({ka:' ',en:null},'all')).data.title,{ka:'ბათუმის სტადიონი'});
 assert.deepEqual((await upload({ka:'სათაური',en:'Stadium'},'all')).data.title,{ka:'სათაური',en:'Stadium'});
 assert.equal((await upload('Explicit')).data.title,'Explicit');
 assert.equal((await upload(undefined,'ka','update')).data.title,undefined,'file replacement must not overwrite an omitted existing title');
});

test('Hidden progress never blocks saving or clears historical values',()=>{const field=flatten(Projects.fields).find(f=>f.name==='progress');for(const status of ['completed','planned'])assert.equal(field.validate(120,{data:{status}}),true);assert.equal(field.validate(120,{data:{status:'ongoing'}}),'შეიყვანეთ რიცხვი 0-დან 100-მდე');assert.equal(field.validate('',{data:{status:'ongoing'}}),true);});

test('Saving an existing Media record with a blank title derives its stored filename',async()=>{const hook=Media.hooks!.beforeValidate![0];const data:any=await hook({data:{title:''},originalDoc:{filename:'existing-photo.jpg'},req:{locale:'ka'}} as any);assert.equal(data.title,'existing-photo');});
