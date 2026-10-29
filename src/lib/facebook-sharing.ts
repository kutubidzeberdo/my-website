import {recordMetadata} from './site-metadata';
import type {Language} from '@/data/content';

export function sharedPageURL(path:string,language:Language='ka') {
  const url=new URL(path,'https://www.stadium.ge');
  url.username='';url.password='';url.protocol='https:';url.host='www.stadium.ge';url.hash='';url.search='';
  // Georgian retains the existing canonical URL; English needs a crawler-visible selector.
  if(language==='en')url.searchParams.set('lang','en');
  return url.toString();
}

export function shareMetadata(title:string,description:string,image:string,path:string,article:boolean,language:Language) {
  let photo='';
  try {const url=new URL(image,'https://www.stadium.ge');if(image&&url.protocol==='https:')photo=url.toString();} catch {}
  const summary=description.replace(/\s+/g,' ').trim()||title;
  const metadata=recordMetadata(title,summary,photo,sharedPageURL(path,language),article,language);
  return {...metadata,alternates:{canonical:sharedPageURL(path,language),languages:{ka:sharedPageURL(path,'ka'),en:sharedPageURL(path,'en')}}};
}
