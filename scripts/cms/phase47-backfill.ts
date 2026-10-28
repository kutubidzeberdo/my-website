import nextEnv from '@next/env';import path from 'node:path';import {readFile,writeFile,unlink} from 'node:fs/promises';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import sharp from 'sharp';import {cardWidth,cardQuality,cardSize} from '../../src/cms/image-sizes';
nextEnv.loadEnvConfig(process.cwd());const apply=process.argv.includes('--apply');
const {getPayload,createLocalReq}=await import('payload');const {default:config}=await import('../../payload.config');const p=await getPayload({config});
const digest=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
const results:{processed:number;skipped:number;failed:number;items:any[]}={processed:0,skipped:0,failed:0,items:[]};let backedUp=false;
try{const used=new Set<number|string>();for(const collection of ['news','projects'] as const){for(const draft of [false,true]){const records=await p.find({collection,draft,pagination:false,limit:0,depth:0,overrideAccess:true});for(const record of records.docs)if(record.image)used.add(typeof record.image==='object'?record.image.id:record.image);}}
const {docs}=await p.find({collection:'media',pagination:false,limit:0,depth:0,locale:'all',overrideAccess:true});for(const doc of docs){let created:string|undefined;try{
 if(!used.has(doc.id)){results.skipped++;results.items.push({id:doc.id,reason:'not used by News/Project cards; main/Next pipeline unchanged'});continue;}
 if(!doc.filename||path.basename(doc.filename)!==doc.filename)throw Error('Invalid local filename');
 const sourcePath=path.resolve('media',doc.filename);const original=await readFile(sourcePath);const originalHash=digest(original);const meta=await sharp(original).metadata();
 const orientedWidth=[5,6,7,8].includes(meta.orientation||0)?meta.height!:meta.width!;
 if(!orientedWidth||orientedWidth<=cardWidth||meta.pages&&meta.pages>1){results.skipped++;results.items.push({id:doc.id,reason:'small/already-sized or animated; retain main image'});continue;}
 const existing=(doc.sizes as any)?.card;
 if(existing?.filename){try{await readFile(path.resolve('media',path.basename(existing.filename)));results.skipped++;results.items.push({id:doc.id,reason:'card already present'});continue;}catch(error:any){if(error.code!=='ENOENT')throw error;}}
 const {data,info}=await sharp(original).rotate().resize({width:cardWidth,fit:'inside',withoutEnlargement:true}).webp({quality:cardQuality}).toBuffer({resolveWithObject:true});
 if(data.length>=original.length){results.skipped++;results.items.push({id:doc.id,reason:'main image already smaller in bytes'});continue;}
 const filename=cardSize.generateImageName!({originalName:path.parse(doc.filename).name,width:info.width,height:info.height,extension:'webp',sizeName:'card'});
 if(!apply){results.items.push({id:doc.id,reason:'would process',width:info.width,height:info.height,bytes:data.length});continue;}
 if(!backedUp){execFileSync(process.execPath,['--import','tsx','scripts/cms/phase47-inspect.ts'],{stdio:'inherit'});backedUp=true;}
 const target=path.resolve('media',filename);
 try{await writeFile(target,data,{flag:'wx'});created=target;}catch(error:any){if(error.code!=='EEXIST')throw error;if(digest(await readFile(target))!==digest(data))throw Error('Derivative filename collision; existing file left intact');}
 // A narrow adapter update avoids normal save hooks persisting computed
 // thumbnail URLs or changing timestamps. Only the new card group is written.
 const tx=await p.db.beginTransaction();if(!tx)throw Error('Transaction unavailable');
 const req=await createLocalReq({},p);req.transactionID=tx;
 try{await p.db.updateOne({collection:'media',id:doc.id,data:{updatedAt:doc.updatedAt,sizes:{card:{filename,width:info.width,height:info.height,filesize:data.length,mimeType:'image/webp'}}},req});await p.db.commitTransaction(tx);}catch(error){await p.db.rollbackTransaction(tx);throw error;}
 created=undefined;
 if(digest(await readFile(sourcePath))!==originalHash)throw Error('Original hash mismatch');
 results.processed++;results.items.push({id:doc.id,filename,width:info.width,height:info.height,bytes:data.length});created=undefined;
 }catch(error){if(created)await unlink(created).catch(()=>{});results.failed++;results.items.push({id:doc.id,error:String(error)});}}
console.log(JSON.stringify({mode:apply?'apply':'dry-run',...results},null,2));if(results.failed)process.exitCode=1;
}finally{await p.destroy();}

process.exit(process.exitCode||0);
