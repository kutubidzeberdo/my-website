import type {Metadata} from 'next';
export function absoluteUrl(path:string){const base=process.env.NEXT_PUBLIC_SITE_URL;if(!base)return undefined;try{const url=new URL(base);if(!['https:','http:'].includes(url.protocol))return undefined;return new URL(path,url.origin).toString();}catch{return undefined;}}
export function recordMetadata(title:string,description:string,image:string,path:string,article=false):Metadata{
 const url=absoluteUrl(path);const photo=absoluteUrl(image);
 return {title,description,...(url?{alternates:{canonical:url}}:{}),openGraph:{title,description,type:article?'article':'website',locale:'ka_GE',...(url?{url}:{}),...(photo?{images:[{url:photo,alt:title}]}:{})},twitter:{card:'summary_large_image',title,description,...(photo?{images:[photo]}:{})}};
}
