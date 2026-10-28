import {APIError,type CollectionConfig,type Field,type FieldHook,type GlobalConfig} from 'payload';
import {englishEditable} from './translation-policy';
import {uiLabel,adminEnglish} from './admin-labels';
const prefix='bilingual_';
const at=(data:any,path:(string|number)[])=>path.reduce((v,k)=>v?.[k],data);
/** Aliases are virtual presentation fields: no new database columns or translated records. */
function aliasRead(name:string):FieldHook{return async({req,collection,global,originalDoc,path,draft,findMany})=>{
 if(!req.user||req.context.bilingualRaw||req.context.bilingualDeleting||findMany)return undefined;
 const key=`${collection?.slug||global?.slug}:${originalDoc?.id}:${originalDoc?.updatedAt}:${draft}`;
 const cache=(req.context.bilingualDocuments??=new Map()) as Map<string,Promise<any>>;
 if(!cache.has(key)){
  const nested={...req,context:{...req.context,bilingualRaw:true}};
  const options={locale:'all' as const,fallbackLocale:false as const,depth:0,overrideAccess:false,req:nested,draft};
  cache.set(key,collection?req.payload.findByID({...options,collection:collection.slug,id:originalDoc!.id}):req.payload.findGlobal({...options,slug:global!.slug}));
 }
 let raw;try{raw=await cache.get(key);}catch(error){if((error as any)?.status===404)return undefined;throw error;}const value=at(raw,[...path.slice(0,-1),name]);
 return {ka:value?.ka??null,en:value?.en??null};
};}
function georgianOnly(field:Field):Field{return {type:'group',label:false,admin:{...('position' in (field.admin||{})?{position:field.admin!.position as 'sidebar'}:{}),custom:{pmcGeorgianOnly:true},components:{Field:'/src/cms/admin/BilingualFields#GeorgianOnly'}},fields:[field]};}
function hasEnglish(field:Field):boolean{
 if(field.admin?.custom?.pmcGeorgianOnly)return false;
 if(field.admin?.custom?.pmcEnglish===true)return true;
 if('fields' in field)return field.fields.some(hasEnglish);
 if(field.type==='tabs')return field.tabs.some(tab=>tab.fields.some(hasEnglish));
 return false;
}
function adapt(fields:Field[],entity:string,parent:string[]=[]):Field[]{return fields.flatMap((original):Field[]=>{
 let field=(original.admin&&'description' in original.admin&&typeof original.admin.description==='string'?{...original,admin:{...original.admin,description:uiLabel(original.admin.description)}}:original) as Field;
 if('validate' in field&&typeof field.validate==='function'){const validate=field.validate;field={...field,validate:async(value:any,options:any)=>{const result=await (validate as Function)(value,options);return typeof result==='string'&&options.req?.i18n?.language==='en'?(adminEnglish[result]||result):result;}} as Field;}
 if(field.type==='tabs')return [{...field,tabs:field.tabs.map(t=>({...t,label:typeof t.label==='string'?uiLabel(t.label):t.label,fields:adapt(t.fields,entity,parent)}))} as Field];
 if(!('name' in field))return ['fields' in field?{...field,label:'label' in field&&typeof field.label==='string'?uiLabel(field.label):undefined,fields:adapt(field.fields,entity,parent)} as Field:field];
 if(('hidden' in (field.admin||{})&&(field.admin as any)?.hidden)||('hidden' in field&&field.hidden))return [field];
 if(field.type==='ui')return [georgianOnly(field)];
 const path=[...parent,field.name];
 if(field.localized&&['text','textarea','richText'].includes(field.type)){
  const base:any={...field,localized:false,required:false,unique:false,index:false,validate:()=>true,hooks:undefined,defaultValue:undefined,access:undefined,admin:{...field.admin,position:undefined,components:undefined}};
  const allowed=englishEditable(entity,path);
  const label=entity==='statistics'&&field.name==='title'?{ka:'დასახელება',en:'Label'}:entity==='slides'&&field.name==='buttonText'?{ka:'ღილაკის ტექსტი',en:'Button Text'}:typeof field.label==='string'?uiLabel(field.label):field.label;
  const alias:Field={name:prefix+field.name,type:'group',virtual:true,label:false,access:field.access,admin:{custom:{pmcEnglish:allowed},components:{Field:'/src/cms/admin/BilingualFields#LocalizedField'}},hooks:{afterRead:[aliasRead(field.name)]},fields:[{...base,name:'ka',label},{...base,name:'en',label}]};
  return [{...field,admin:{...field.admin,hidden:true}} as Field,alias];
 }
 const adapted={...field,...('fields' in field?{fields:adapt(field.fields,entity,path)}:{}),...('label' in field&&typeof field.label==='string'?{label:uiLabel(field.label)}:{}),...('labels' in field&&field.labels?{labels:Object.fromEntries(Object.entries(field.labels).map(([k,v])=>[k,typeof v==='string'?uiLabel(v):v]))}:{}),...(field.type==='select'?{options:field.options.map(o=>typeof o==='string'?o:{...o,label:typeof o.label==='string'?uiLabel(o.label):o.label})}:{})} as Field;
 if(!hasEnglish(adapted))return [georgianOnly(adapted)];
 if(adapted.type==='array')adapted.admin={...adapted.admin,components:{...adapted.admin?.components,Field:'/src/cms/admin/BilingualFields#TranslationArray'}};
 return [adapted];
});}
/** Convert only known virtual aliases to Payload's native all-locale input shape. */
export function bilingualData(data:any,fields:Field[]):boolean{
 if(!data||typeof data!=='object')return false;let found=false;
 for(const f of fields){if(f.type==='tabs'){for(const tab of f.tabs)found=bilingualData('name' in tab&&tab.name?data[tab.name]:data,tab.fields)||found;continue;}
 if(!('name' in f)){if('fields' in f)found=bilingualData(data,f.fields)||found;continue;}
 if(f.name.startsWith(prefix)&&'virtual' in f&&f.virtual===true&&Object.hasOwn(data,f.name)){
  const value=data[f.name];if(value&&typeof value==='object'){const locales=Object.fromEntries(['ka','en'].filter(locale=>Object.hasOwn(value,locale)).map(locale=>[locale,value[locale]]));if(Object.keys(locales).length){data[f.name.slice(prefix.length)]=locales;found=true;}}delete data[f.name];
 }else if('fields' in f){if(f.type==='array'){for(const row of Array.isArray(data[f.name])?data[f.name]:[])found=bilingualData(row,f.fields)||found;}else found=bilingualData(data[f.name],f.fields)||found;}
 }
 return found;
}
// Native document chrome expects scalar display fields; aliases retain both locale values.
function editorResponse(data:any,fields:Field[]):any{
 if(!data||typeof data!=='object')return data;
 for(const field of fields){if(field.type==='tabs'){for(const tab of field.tabs)editorResponse('name' in tab&&tab.name?data[tab.name]:data,tab.fields);continue;}
 if(!('name' in field)){if('fields' in field)editorResponse(data,field.fields);continue;}
 if('virtual' in field&&field.virtual)continue;
 if('localized' in field&&field.localized&&data[field.name]&&typeof data[field.name]==='object'&&!Array.isArray(data[field.name]))data[field.name]=data[field.name].ka??null;
 if('fields' in field){if(field.type==='array'){for(const row of Array.isArray(data[field.name])?data[field.name]:[])editorResponse(row,field.fields);}else editorResponse(data[field.name],field.fields);}
 }
 return data;
}
export function bilingualEditor(entity:CollectionConfig|GlobalConfig){
 const flatten=(fields:Field[]):Field[]=>fields.flatMap(f=>f.type==='tabs'&&f.tabs.every(t=>!('name' in t))?f.tabs.flatMap(t=>flatten(t.fields)):f.type==='collapsible'?flatten(f.fields):[f]);
 entity.fields=adapt(flatten(entity.fields),entity.slug);
 const unwrap=({args,operation}:any)=>{if(operation==='delete')args.req.context.bilingualDeleting=true;if(bilingualData(args.data,entity.fields)&&args.req.locale!=='all')throw new APIError(args.req.i18n.language==='en'?'Save bilingual content with locale=all.':'ორენოვანი შინაარსი შეინახეთ locale=all რეჟიმში.',400);return args;};
 // Run before Payload fills omitted virtual groups from defaults/existing data.
 entity.hooks={...entity.hooks,beforeOperation:[unwrap,...(entity.hooks?.beforeOperation||[]) as any],afterRead:[...(entity.hooks?.afterRead||[]) as any,({doc,req}:any)=>req.query?.bilingual==='true'&&!req.context.bilingualRaw?editorResponse(doc,entity.fields):doc]};
 entity.fields.unshift({name:'contentLanguageTabs',type:'ui',admin:{components:{Field:'/src/cms/admin/BilingualFields#ContentTabs'}}});
 const actions={PublishButton:'/src/cms/admin/Actions#PublishAction',UnpublishButton:'/src/cms/admin/Actions#UnpublishAction',SaveDraftButton:'/src/cms/admin/Actions#SaveDraftAction',SaveButton:'/src/cms/admin/Actions#SaveAction'};
 if('labels' in entity){const c=entity as CollectionConfig;c.admin={...c.admin,components:{...c.admin?.components,edit:{...c.admin?.components?.edit,...actions}}};}
 else {const g=entity as GlobalConfig;g.admin={...g.admin,components:{...g.admin?.components,elements:{...g.admin?.components?.elements,...actions}}};}
 if('labels' in entity&&entity.labels){for(const k of ['singular','plural'] as const)if(typeof entity.labels[k]==='string')entity.labels[k]=uiLabel(entity.labels[k] as string);}
 if('label' in entity&&typeof entity.label==='string')entity.label=uiLabel(entity.label);
 if(typeof entity.admin?.description==='string')entity.admin.description=uiLabel(entity.admin.description);
}
