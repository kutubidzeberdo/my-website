'use client';
import { useEffect, useState } from 'react';
import {useCMS} from './CMSContext';
export function PreviewNotice(){const {previewNotice}=useCMS();return <p className="development-notice wrap" lang="ka">{previewNotice}</p>;}
export function ScrollToTop(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{const update=()=>setVisible(window.scrollY>300);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[]);
 return visible?<button className="scroll-top" aria-label="დასაწყისში დაბრუნება" onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v14"/></svg></button>:null;
}
