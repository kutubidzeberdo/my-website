'use client';
import {useEffect,useState} from 'react';
import {useFormFields,useConfig} from '@payloadcms/ui';
import {videoEmbedURL} from '../../lib/video-embed';
export function VideoPreview(){const value=useFormFields(([fields])=>String(fields.videoURL?.value||''));const url=videoEmbedURL(value);return url?<div className="pmc-video-preview"><iframe title="ვიდეოს წინასწარი ხედი" src={url} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div>:<p className="pmc-editor-help">ჩასვით YouTube ან Vimeo ვიდეოს HTTPS ბმული წინასწარი ხედისთვის.</p>;}
export function GalleryPreview(){
 const ids=useFormFields(([fields])=>JSON.stringify(Object.entries(fields).filter(([key,f])=>/^gallery\.\d+\.image$/.test(key)&&f.value).map(([,f])=>typeof f.value==='object'?(f.value as {id:number}).id:f.value)));
 const [images,setImages]=useState<{id:number;url:string;alt:string}[]>([]);const {config}=useConfig();
 useEffect(()=>{const selected=JSON.parse(ids);if(!selected.length){setImages([]);return;}const controller=new AbortController();fetch(`${config.routes.api}/media?where[id][in]=${encodeURIComponent(selected.join(','))}&limit=100&depth=0`,{credentials:'same-origin',signal:controller.signal}).then(r=>r.ok?r.json():{docs:[]}).then(data=>setImages(selected.flatMap((id:number)=>{const doc=data.docs?.find((d:{id:number})=>d.id===id);return doc?[{id:doc.id,url:doc.sizes?.thumbnail?.url||doc.url,alt:doc.alt||''}]:[]}))).catch(()=>{});return()=>controller.abort();},[ids,config.routes.api]);
 return images.length?<div className="pmc-gallery-preview" aria-label="გალერეის წინასწარი ხედი">{images.map((image,index)=><figure key={`${image.id}-${index}`}><img src={image.url} alt={image.alt}/><figcaption>{index+1}</figcaption></figure>)}</div>:<p className="pmc-editor-help">დაამატეთ ფოტოები ქვემოთ; გადაათრიეთ რიგების შესაცვლელად.</p>;
}
