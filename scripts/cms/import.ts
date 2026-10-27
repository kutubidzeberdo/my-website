import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { content, slideImages } from '../../src/data/content';
import { homepage, projects, news } from '../../src/data/homepage';
import { contact, sampleReview } from '../../src/data/contact';
import { previewNotice, testimonials } from '../../src/data/ui';
loadEnvConfig(process.cwd());
const dry=process.argv.includes('--dry-run');
const {getPayload}=await import('payload');
const {default:config}=await import('../../payload.config');
const payload=await getPayload({config});
const counts:Record<string,{created:number;skipped:number}>={};
const mediaIDs=new Map<string,number>();
function tally(key:string,skip:boolean){counts[key]??={created:0,skipped:0};counts[key][skip?'skipped':'created']++;}
async function create(collection: 'media'|'project-categories'|'news'|'projects'|'slides'|'testimonials'|'statistics',sourceKey:string,data:Record<string,unknown>,filePath?:string){
 const found=await payload.find({collection,where:{sourceKey:{equals:sourceKey}},limit:1,depth:0,overrideAccess:true});
 tally(collection,!!found.docs.length);
 if(found.docs[0])return Number(found.docs[0].id);
 if(dry)return -1;
 const doc=await payload.create({collection,data:{...data,sourceKey} as never,...(filePath?{filePath}:{}),locale:'ka',overrideAccess:true,context:{cmsImport:true}});
 return Number(doc.id);
}
function lexical(value:string){return {root:{type:'root',format:'',indent:0,version:1,direction:null,children:[{type:'paragraph',format:'',indent:0,version:1,direction:null,textFormat:0,textStyle:'',children:[{type:'text',version:1,text:value,format:0,detail:0,mode:'normal',style:''}]}]}};}
function structured(value:unknown):unknown{
 if(value&&typeof value==='object'&&!Array.isArray(value)&&'ka' in value)return (value as {ka:string}).ka;
 if(Array.isArray(value))return value.map(v=>({value:structured(v)}));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,structured(v)]));
 return value;
}
try{
 for(const file of (await readdir('public/images')).sort()){
  const absolute=path.resolve('public/images',file);const bytes=await readFile(absolute);
  const id=await create('media',`public/images/${file}`,{title:file,alt:file.includes('logo')?'კომპანიის ლოგო':file.includes('portrait')?'საილუსტრაციო პორტრეტი — არ არის კომპანიის კლიენტი':'საილუსტრაციო ფოტო',sourceHash:createHash('sha256').update(bytes).digest('hex')},absolute);
  mediaIDs.set(`/images/${file}`,id);
 }
 const image=(value:string)=>mediaIDs.get(value)!;
 const categories=[];
 for(const [i,title] of homepage.categories.entries())categories.push(await create('project-categories',`category:${i}`,{title:title.ka,order:i}));
 for(const p of projects){
  await create('projects',`project:${p.id}`,{title:p.name.ka,slug:p.id,summary:p.description.ka,content:lexical(p.description.ka),image:image(p.image),gallery:[{image:image(p.image),alt:'პროექტის საილუსტრაციო ფოტო'}],category:categories[p.category],status:p.statusCode,progress:'progress' in p?p.progress:null,phase:'phase' in p?p.phase?.ka:null,progressVerified:false,progressUpdatedAt:'progress' in p?'2026-10-20T00:00:00.000Z':null,illustrative:true,_status:'published'});
 }
 for(const n of news)await create('news',`news:${n.id}`,{title:n.title.ka,slug:n.id,summary:n.body.ka,content:lexical(n.body.ka),image:image(n.image),publishedAt:`${n.date}T00:00:00.000Z`,illustrative:true,_status:'published'});
 for(const [i,slide] of content.ka.slides.entries())await create('slides',`slide:${i}`,{title:slide[0],description:slide[1],image:image(slideImages[i]),buttonText:content.ka.explore,buttonURL:'/projects',order:i,active:true});
 for(const [i,[value,label]] of homepage.metrics.entries())await create('statistics',`statistic:${i}`,{title:label.ka,value:Number(value),order:i,active:true,illustrative:true});
 for(const [i,quote] of [sampleReview,testimonials.ka.quotes[1]].entries())await create('testimonials',`testimonial:${i}`,{title:'საილუსტრაციო პერსონა',position:'გამოხმაურების ნიმუში',quote,portrait:image('/images/testimonial-portrait.jpg'),notice:testimonials.ka.note,illustrative:true,active:true,order:i});
 // Read the official source without changing, evaluating or rephrasing it.
 const aboutSource=await readFile('src/data/about.ts','utf8');
 const tree=ts.createSourceFile('about.tsx',aboutSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let paragraphs:string[]=[];
 function walk(node:ts.Node){if(ts.isVariableDeclaration(node)&&node.name.getText(tree)==='paragraphs'&&node.initializer&&ts.isArrayLiteralExpression(node.initializer))paragraphs=node.initializer.elements.map(e=>{if(!ts.isStringLiteral(e))throw new Error('Unexpected official text source');return e.text;});ts.forEachChild(node,walk);}
 walk(tree);if(paragraphs.length!==5)throw new Error('Official About paragraphs could not be verified');
 const globals=[
  {slug:'about' as const,data:{title:'კომპანიის შესახებ',paragraphs:paragraphs.map(text=>({text}))}},
  {slug:'site-settings' as const,data:{companyName:content.ka.company,...contact,logo:image('/images/company-logo.png'),symbolLogo:image('/images/company-logo-symbol.webp'),fullLogo:image('/images/company-logo-full.webp'),copy:structured(content.ka)}},
  {slug:'homepage' as const,data:{sections:structured(homepage),testimonialsCopy:structured(testimonials.ka),previewNotice}},
 ];
 for(const {slug,data} of globals){const current=await payload.findGlobal({slug,depth:0,overrideAccess:true});const exists=Boolean(current.migrationSource);tally(slug,exists);if(!dry&&!exists)await payload.updateGlobal({slug,data:{...data,migrationSource:'legacy-v1'} as never,locale:'ka',overrideAccess:true,context:{cmsImport:true}});}
 console.log(JSON.stringify({mode:dry?'dry-run (no writes)':'import',counts},null,2));
}finally{await payload.destroy();}

// Lexical keeps worker handles; the one-shot CLI has completed cleanup.
process.exit(0);
