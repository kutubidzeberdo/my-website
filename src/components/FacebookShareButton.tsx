'use client';
import {useEffect,useState} from 'react';
import {usePublicLanguage} from './PublicLanguage';
import {sharedPageURL} from '@/lib/facebook-sharing';
export default function FacebookShareButton({url}:{url?:string}){
 const language=usePublicLanguage();
 const [pageUrl,setPageUrl]=useState(url);
 useEffect(()=>{if(!url){const current=new URL(window.location.href);setPageUrl(sharedPageURL(current.pathname,current.searchParams.get('lang')==='en'?'en':language));}},[url,language]);
 const label=<><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l1-4h-4V7c0-1 1-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v9z"/></svg>{language==='en'?'Share on Facebook':'Facebook-ზე გაზიარება'}</>;
 return pageUrl?<a className="button facebook-share" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer">{label}</a>:<button className="button facebook-share" disabled>{label}</button>;
}
