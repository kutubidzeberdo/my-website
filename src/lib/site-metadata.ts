import type {Metadata} from 'next';
export function absoluteUrl(path:string){const base=process.env.NEXT_PUBLIC_SITE_URL||process.env.CMS_SERVER_URL||'http://localhost:3000';if(!base)return undefined;try{const url=new URL(base);if(!['https:','http:'].includes(url.protocol))return undefined;const target=new URL(path,url.origin);return ['https:','http:'].includes(target.protocol)?target.toString():undefined;}catch{return undefined;}}
export function recordMetadata(title:string,description:string,image:string,path:string,article=false,language?:'ka'|'en'):Metadata{
 const url=absoluteUrl(path);const photo=image?absoluteUrl(image):undefined;
 return {title,description,...(url?{alternates:{canonical:url}}:{}),openGraph:{title,description,type:article?'article':'website',locale:language==='en'?'en_US':'ka_GE',...(language?{alternateLocale:[language==='en'?'ka_GE':'en_US']}:{}),...(url?{url}:{}),...(photo?{images:[{url:photo,alt:title}]}:{})},twitter:{card:'summary_large_image',title,description,...(photo?{images:[photo]}:{})}};
}
