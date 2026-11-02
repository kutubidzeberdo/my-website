'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrayField,useConfig,useForm,useTranslation} from '@payloadcms/ui';
import type {ArrayFieldClientProps} from 'payload';

/** Shared authenticated Media endpoint; successful uploads survive individual failures. */
function BatchImages({onUploaded,disabled=false}:{onUploaded:(ids:(number|string)[])=>void;disabled?:boolean}){
 const {config}=useConfig();const {i18n}=useTranslation();const en=i18n.language==='en';
 const input=useRef<HTMLInputElement>(null);const busy=useRef(false);const [uploading,setUploading]=useState(false);const [messages,setMessages]=useState<string[]>([]);
 async function upload(files:File[]){
  if(busy.current||disabled||!files.length)return;busy.current=true;setUploading(true);setMessages([]);
  const ids:(number|string)[]=[];const errors:string[]=[];
  try{
   // Bounded requests preserve selection order and avoid unbounded Sharp memory use.
   for(const file of files){try{
    const body=new FormData();body.append('file',file);body.append('_payload',JSON.stringify({}));
    const response=await fetch(`${config.routes.api}/media?locale=ka`,{method:'POST',credentials:'same-origin',body});
    const result=await response.json();if(!response.ok||!result.doc?.id)throw new Error(result.errors?.map((e:any)=>e.message).join('; ')||response.statusText);
    ids.push(result.doc.id);
   }catch(error){errors.push(`${file.name}: ${error instanceof Error?error.message:String(error)}`);}}
   if(ids.length)onUploaded(ids);
   setMessages([en?`${ids.length} images uploaded`:`აიტვირთა ${ids.length} ფოტო`,...errors]);
  }finally{busy.current=false;setUploading(false);if(input.current)input.current.value='';}
 }
 return <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();void upload(Array.from(e.dataTransfer.files));}} aria-busy={uploading}>
  <button type="button" disabled={disabled||uploading} onClick={()=>input.current?.click()}>{uploading?(en?'Uploading…':'იტვირთება…'):(en?'Upload multiple images or drop files here':'რამდენიმე ფოტოს ატვირთვა ან ფაილების აქ გადმოტანა')}</button>
  <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden disabled={disabled||uploading} onChange={e=>void upload(Array.from(e.target.files||[]))}/>
  <div role="status">{messages.map((message,index)=><p key={index}>{message}</p>)}</div>
 </div>;
}
export function MediaBatchImages(){const router=useRouter();return <BatchImages onUploaded={()=>router.refresh()}/>;}
export function GalleryField(props:ArrayFieldClientProps){
 const {addFieldRow,getDataByPath}=useForm();const path=props.path||props.field.name;
 return <><BatchImages disabled={props.readOnly} onUploaded={ids=>{
  const start=(getDataByPath(path) as unknown[]|undefined)?.length||0;
  ids.forEach((id,index)=>addFieldRow({path,schemaPath:props.schemaPath||path,rowIndex:start+index,subFieldState:{image:{value:id,initialValue:id,valid:true}}}));
 }}/><ArrayField {...props}/></>;
}
