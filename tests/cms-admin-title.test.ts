import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adminTitle,adminTitleSelect} from '../src/cms/admin-title';
import {bilingualEditor} from '../src/cms/bilingual';
import {Projects,News,Media,Categories,Slides,Testimonials,Statistics} from '../src/cms/collections';
import {afterRead} from '../node_modules/payload/dist/fields/hooks/afterRead/index.js';

const collection:any={slug:'projects',fields:[{name:'title',type:'text',localized:true,admin:{hidden:true}}]};
function request(locale='ka'):any{return {user:{id:1},locale,context:{},query:{},payload:{config:{defaultDepth:0,maxDepth:10,localization:{defaultLocale:'ka',locales:[{code:'ka'},{code:'en'}],localeCodes:['ka','en']}}}};}
async function read(doc:any,locale='ka',fix=true,overrides:any={}){
 const req={...request(locale),...overrides};const config=overrides.collection||collection;
 const result=fix?await adminTitle({doc,req,collection:config} as any):doc;
 return afterRead({doc:result,req,collection:config,locale,fallbackLocale:false,depth:0,findMany:true,context:req.context} as any);
}
test('Reproduces native list fallback=false missing English title and fixes it before flattening',async()=>{
 assert.equal((await read({title:{ka:'პროექტი',en:null}},'en',false)).title,null);
 assert.equal((await read({title:{ka:'პროექტი',en:null}},'en')).title,'პროექტი');
});
test('Georgian and English labels use real titles, including partial/blank translations',async()=>{
 for(const en of [undefined,null,'','   '])assert.equal((await read({title:{ka:'სათაური',en}},'en')).title,'სათაური');
 assert.equal((await read({title:{ka:'სათაური',en:'English title'}},'en')).title,'English title');
 assert.equal((await read({title:{ka:'სათაური',en:'English title'}},'ka')).title,'სათაური');
 assert.equal((await read({title:'Existing scalar'},'en')).title,'Existing scalar');
});
test('Media labels use stored title first, filename without extension when no title exists',async()=>{
 const config={...collection,slug:'media'};
 assert.equal((await read({title:{ka:'ფოტო',en:''},filename:'fallback.jpg'},'en',true,{collection:config})).title,'ფოტო');
 assert.equal((await read({title:{ka:null,en:''},filename:'ბათუმი.original.jpg'},'en',true,{collection:config})).title,'ბათუმი.original');
});
test('Public reads, raw bilingual reads and editor all-locale values are unchanged',async()=>{
 for(const overrides of [{user:undefined},{locale:'all'},{context:{bilingualRaw:true}},{query:{bilingual:'true'}}]){
 const doc={title:{ka:'სათაური',en:' '}};assert.strictEqual(await adminTitle({doc,req:{...request('en'),...overrides},collection} as any),doc);
 }
});
test('Read labels do not mutate stored locale maps, unrelated fields or optional validation',async()=>{
 const doc={id:67,title:{ka:'პროექტი',en:null},summary:{ka:'აღწერა',en:null}};const original=structuredClone(doc);
 const result:any=await adminTitle({doc,req:request('en'),collection} as any);
 assert.deepEqual(doc,original);assert.equal(result.title,'პროექტი');assert.strictEqual(result.summary,doc.summary);
});
test('All title-bearing bilingual collections share the label fix without changing useAsTitle',()=>{
 for(const original of [Projects,News,Media,Categories,Slides,Testimonials,Statistics]){
 const copy={...original,admin:{...original.admin},fields:[...original.fields],hooks:{...original.hooks}};bilingualEditor(copy);
 assert.equal(copy.admin.useAsTitle,'title');assert.ok(copy.hooks.beforeRead?.includes(adminTitle));assert.ok(copy.hooks.beforeOperation?.includes(adminTitleSelect));
 }
});
test('Relationship title-only selection includes filename fallback for authenticated Media reads only',async()=>{
 const req=request('en');const args:any={req,select:{title:true}};
 await adminTitleSelect({args,operation:'find',collection:{slug:'media'}} as any);assert.deepEqual(args.select,{title:true,filename:true});
 for(const [slug,operation,user,locale] of [['projects','find',true,'en'],['media','update',true,'en'],['media','find',false,'en'],['media','find',true,'all']] as const){
 const args:any={req:{...request(locale),user:user?{id:1}:undefined},select:{title:true}};
 await adminTitleSelect({args,operation,collection:{slug}} as any);assert.deepEqual(args.select,{title:true});
 }
});
