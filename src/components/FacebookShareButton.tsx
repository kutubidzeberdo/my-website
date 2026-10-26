'use client';
import {useEffect,useState} from 'react';
export default function FacebookShareButton({url}:{url?:string}){
 const [pageUrl,setPageUrl]=useState(url);
 useEffect(()=>{if(!url){const current=new URL(window.location.href);current.hash='';setPageUrl(current.toString());}},[url]);
 const label=<><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l1-4h-4V7c0-1 1-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v9z"/></svg>Facebook-ზე გაზიარება</>;
 return pageUrl?<a className="button facebook-share" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer">{label}</a>:<button className="button facebook-share" disabled>{label}</button>;
}
