export type ImageDetails={card:string;width:number;height:number;alt:string;focalX:number;focalY:number};
const coordinate=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(100,value)):50;
export function imageDetails(media:any):ImageDetails|undefined{
 if(!media?.url)return undefined;
 const source=media.sizes?.card?.url||media.url;
 return {card:media.sizes?.card?.url&&media.updatedAt?`${source}${source.includes('?')?'&':'?'}v=${encodeURIComponent(media.updatedAt)}`:source,width:media.width||1440,height:media.height||850,alt:media.alt||'',focalX:coordinate(media.focalX),focalY:coordinate(media.focalY)};
}
export function coverImage(record:{image:string;imageDetails?:ImageDetails}){
 const details=record.imageDetails;
 return {src:details?.card||record.image,alt:details?.alt||'',style:{objectPosition:`${details?.focalX??50}% ${details?.focalY??50}%`}};
}
