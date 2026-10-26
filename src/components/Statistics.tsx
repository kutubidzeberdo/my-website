'use client';
import {useEffect,useRef,useState} from 'react';
import type {Language} from '@/data/content';
import {homepage} from '@/data/homepage';
export default function Statistics({language}:{language:Language}){
 const ref=useRef<HTMLElement>(null);const [fraction,setFraction]=useState(0);
 useEffect(()=>{
  const element=ref.current;if(!element)return;let frame=0;let started=false;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting)||started)return;started=true;observer.disconnect();if(motion.matches){setFraction(1);return;}let start:number|undefined;const tick=(now:number)=>{start??=now;const progress=Math.min((now-start)/1800,1);setFraction(1-Math.pow(1-progress,3));if(progress<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);},{threshold:.15});
  observer.observe(element);const change=()=>{if(motion.matches&&started){cancelAnimationFrame(frame);setFraction(1);}};motion.addEventListener('change',change);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);motion.removeEventListener('change',change);};
 },[]);
 return <section ref={ref} className="statistics-strip" aria-label={language==='ka'?'სტატისტიკა':'Statistics'}><div className="wrap statistics-grid">{homepage.metrics.map(([value,label])=><div className="statistic" key={label.en}><div><strong aria-label={value}>{Math.round(Number(value)*fraction)}</strong></div><p>{label[language]}</p></div>)}</div></section>;
}
