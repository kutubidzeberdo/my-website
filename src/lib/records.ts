import {validGalleryPhotos, type GalleryPhoto} from './gallery';
import { projects, news, homepage } from '@/data/homepage';
export type ProjectRecord = {
 statusCode:'ongoing'|'completed'|'planned'; id:string; name:{ka:string;en:string}; category:number; status:{ka:string;en:string}; image:string; description:{ka:string;en:string}; progress?:number; progressVerified?:boolean; phase?:{ka:string;en:string};
 location?:string; updatedAt?:string; timeline?:{title:string;date?:string}[]; gallery?:GalleryPhoto[]; youtubeId?:string; beforeAfter?:{before:string;after:string}; budget?:string; client?:string; contractor?:string; investment?:string; area?:string;
};
export type NewsRecord = (typeof news)[number] & {gallery?:GalleryPhoto[];youtubeId?:string};
export const projectRecords:ProjectRecord[]=projects.map(p=>({...p,...(p.progress!==undefined?{updatedAt:'2026-10-20'}:{}),gallery:'gallery' in p?validGalleryPhotos(p.gallery):[{src:p.image,alt:'პროექტის საილუსტრაციო ფოტო'}]}));
export const newsRecords:NewsRecord[]=news;
export const projectStatus=(p:ProjectRecord)=>p.statusCode;
export const statusLabel=(p:ProjectRecord)=>p.status.ka.replace(' · DEMO','');
export const categoryLabel=(p:ProjectRecord)=>homepage.categories[p.category].ka;
export function formatDate(value:string){const date=new Date(`${value}T00:00:00Z`);const months=['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];return `${date.getUTCDate()} ${months[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;}
