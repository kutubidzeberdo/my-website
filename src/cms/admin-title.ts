import type {CollectionBeforeOperationHook,CollectionBeforeReadHook} from 'payload';
import {mediaTitle} from './media-title';

const titleText=(value:unknown):string|undefined=>typeof value==='string'&&value.trim()?value:undefined;
/** Resolve only admin labels, before Payload flattens locales with fallback disabled. */
export const adminTitle:CollectionBeforeReadHook=({doc,req,collection})=>{
 // All-locale reads supply the bilingual editor's actual stored translations.
 if(!req.user||req.locale==='all'||req.context.bilingualRaw||req.query?.bilingual==='true')return doc;
 const value=doc.title;
 const title=value&&typeof value==='object'
  ? titleText(value[req.locale==='en'?'en':'ka'])||titleText(value.ka)
  : titleText(value);
 const label=title||(collection.slug==='media'&&typeof doc.filename==='string'?mediaTitle(doc.filename):undefined);
 return label===undefined?doc:{...doc,title:label};
};

/** Native relationship options request only useAsTitle; retain the Media fallback input. */
export const adminTitleSelect:CollectionBeforeOperationHook=({args,operation,collection})=>{
 const req=args.req;
 if(collection.slug==='media'&&['find','findByID'].includes(operation)&&req?.user&&req.locale!=='all'&&!req.context.bilingualRaw&&'select' in args&&args.select?.title===true)args.select={...args.select,filename:true};
 return args;
};
