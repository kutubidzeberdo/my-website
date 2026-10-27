import {APIError,type CollectionBeforeValidateHook,type CollectionBeforeChangeHook} from 'payload';
import {sql,type PostgresAdapter} from '@payloadcms/db-postgres';
import {slugify} from './slug-shared';
export {slugify} from './slug-shared';
export const prepareSlug:CollectionBeforeValidateHook=async({data,originalDoc,collection,req,operation})=>{
 if(!data)return data;
 // Serialize slug/alias decisions in the same native transaction as the write.
 const transactionID=await req.transactionID;const transaction=transactionID&&(req.payload.db as unknown as PostgresAdapter).sessions[String(transactionID)]?.db;
 if(transaction)await transaction.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`pmc-slug:${collection.slug}`}))`);
 const title=typeof data.title==='string'?data.title:data.title?.ka||data.title?.en||'';
 const supplied=data.slug!==undefined&&data.slug!==null&&data.slug!=='';
 let next=supplied?slugify(String(data.slug)):originalDoc?.slug||slugify(title);
 if(!next)throw new APIError('სათაურიდან გვერდის მისამართი ვერ შეიქმნა; მიუთითეთ ლათინური მისამართი.',400);
 const records=await req.payload.find({collection:collection.slug as 'news',pagination:false,limit:0,depth:0,overrideAccess:true,req});
 const used=new Set(records.docs.filter(d=>d.id!==originalDoc?.id).flatMap((d:any)=>[d.slug,...(Array.isArray(d.previousSlugs)?d.previousSlugs:[])]));
 if((!supplied||data.slug===slugify(title))&&operation==='create'){const base=next;let n=2;while(used.has(next)||['ongoing','completed','create'].includes(next))next=`${base}-${n++}`;}
 if(used.has(next)||['ongoing','completed','create'].includes(next))throw new APIError('ეს გვერდის მისამართი უკვე გამოიყენება. აირჩიეთ სხვა მისამართი.',400);
 data.slug=next;return data;
};
export const retainSlug:CollectionBeforeChangeHook=({data,originalDoc})=>{if(originalDoc?.slug&&data.slug&&data.slug!==originalDoc.slug)data.previousSlugs=[...new Set([...(Array.isArray(originalDoc.previousSlugs)?originalDoc.previousSlugs:[]),originalDoc.slug])].filter(s=>s!==data.slug);return data;};
