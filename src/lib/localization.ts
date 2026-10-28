// Resolve only locale maps; shared arrays, relationships and Lexical nodes retain their shape.
export function meaningful(value:unknown):boolean {
 if(typeof value==='string')return value.trim().length>0;
 if(!value||typeof value!=='object')return value!==null&&value!==undefined;
 const node=value as any;
 if(node.root)return meaningful(node.root);
 if(node.type==='text')return meaningful(node.text);
 if(Array.isArray(node.children))return node.children.some(meaningful)||['upload','block','horizontalrule'].includes(node.type);
 return Array.isArray(value)?value.some(meaningful):Object.values(value).some(meaningful);
}
export function resolveLocalized(value:any,locale:'ka'|'en'):any {
 if(Array.isArray(value))return value.map(v=>resolveLocalized(v,locale));
 if(value&&typeof value==='object'){
  const keys=Object.keys(value);
  if(keys.length&&keys.every(k=>k==='ka'||k==='en'))return resolveLocalized(meaningful(value[locale])?value[locale]:value.ka,locale);
  return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,resolveLocalized(v,locale)]));
 }
 return value;
}
