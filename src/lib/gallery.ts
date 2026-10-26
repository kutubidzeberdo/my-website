export type GalleryPhoto = {src:string;alt?:string;caption?:string};
export function validGalleryPhotos(input:unknown):GalleryPhoto[]{
 if(!Array.isArray(input))return [];
 const seen=new Set<string>();const photos:GalleryPhoto[]=[];
 for(const entry of input){if(!entry||typeof entry!=='object'||typeof entry.src!=='string')continue;const src=entry.src.trim();if(!src||seen.has(src)||/[\x00-\x1f\x7f\\]/.test(src))continue;
  let valid=false;try{const url=new URL(src,'https://gallery.invalid');valid=(src.startsWith('/')&&!src.startsWith('//')||/^https?:\/\//.test(src))&&['http:','https:'].includes(url.protocol)&&!url.username&&!url.password;}catch{/* Invalid URLs are omitted. */}
  if(!valid)continue;seen.add(src);photos.push({src,alt:typeof entry.alt==='string'?entry.alt:'',...(typeof entry.caption==='string'&&entry.caption.trim()?{caption:entry.caption.trim()}:{})});
 }
 return photos;
}
export function galleryLayout(count:number){return count<=0?'empty':count===1?'single':count===2?'pair':count===3?'trio':count===4?'four':'portfolio';}
