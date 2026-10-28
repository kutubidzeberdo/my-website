import type {GalleryPhoto} from './gallery';
export type ProjectRecord = {
 cmsID?:number;statusCode:'ongoing'|'completed'|'planned'; id:string; name:{ka:string;en:string}; category:number; status:{ka:string;en:string}; image:string; description:{ka:string;en:string}; progress?:number; phase?:{ka:string;en:string};
 location?:string; updatedAt?:string; timeline?:{title:string;date?:string}[]; gallery?:GalleryPhoto[]; youtubeId?:string; beforeAfter?:{before:string;after:string}; categoryTitle?:string;content?:any;videoURL?:string;seo?:any;aliases?:string[];budget?:string; client?:string; contractor?:string; investment?:string; area?:string;
};
export type NewsRecord={cmsID?:number;id:string;title:{ka:string;en:string};body:{ka:string;en:string};image:string;date:string;gallery?:GalleryPhoto[];youtubeId?:string;content?:any;videoURL?:string;seo?:any;aliases?:string[]};
export const projectStatus=(p:ProjectRecord)=>p.statusCode;
export const statusLabel=(p:ProjectRecord)=>p.status.ka.replace(' · DEMO','');
export const categoryLabel=(p:ProjectRecord)=>p.categoryTitle||'';
export function formatDate(value:string){const date=new Date(`${value}T00:00:00Z`);const months=['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];return `${date.getUTCDate()} ${months[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;}
