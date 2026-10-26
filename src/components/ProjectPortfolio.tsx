"use client";
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import type {Language} from '@/data/content';
import {homepage as h,projects} from '@/data/homepage';
export default function ProjectPortfolio({language,filterStatus=false}:{language:Language;filterStatus?:boolean}){
 const [category,setCategory]=useState<number|null>(null);
 const [status,setStatus]=useState('all');
 useEffect(()=>{if(!filterStatus)return;const sync=()=>{const value=new URLSearchParams(location.search).get('status');setStatus(value==='ongoing'||value==='completed'?value:'all');};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[filterStatus]);
 const changeStatus=(value:string)=>{setStatus(value);if(filterStatus){const url=new URL(location.href);if(value==='all')url.searchParams.delete('status');else url.searchParams.set('status',value);history.pushState(null,'',url);}};
 const shown=projects.filter(p=>(category===null||p.category===category)&&(status==='all'||p.statusCode===status)).slice(0,6);
 return <> <section className="portfolio-section section-space wrap" id="projects"><p className="section-label">{h.portfolioLabel[language]}</p><div className="homepage-section-heading"><h2>{h.portfolioTitle[language]}</h2><Link className="homepage-view-all" href="/projects">ყველას ნახვა</Link></div>{filterStatus&&<div className="status-filters project-filters" aria-label="პროექტის სტატუსი">{[['all','ყველა'],['ongoing','მიმდინარე'],['completed','დასრულებული']].map(([value,label])=><button key={value} aria-pressed={status===value} onClick={()=>changeStatus(value)}>{label}</button>)}</div>}<div className="project-filters" aria-label={h.servicesLabel[language]}><button aria-pressed={category===null} onClick={()=>setCategory(null)}>{h.all[language]}</button>{h.categories.map((c,i)=><button aria-pressed={category===i} onClick={()=>setCategory(i)} key={i}>{c[language]}</button>)}</div><div className="portfolio-grid" aria-live="polite">{shown.map(p=><article className="project-card" key={p.id}><Image src={p.image} alt="" fill sizes="(max-width: 600px) 88vw, (max-width: 900px) 44vw, 28vw"/><div className="project-card-content"><p>{h.categories[p.category][language]}</p><h3>{p.name[language]}</h3><span>{p.status[language].replace(' · DEMO', '')}</span><Link href={`/projects/${p.id}`} className="project-preview">{h.preview[language]}<span className="corner-arrow" aria-hidden="true">↗</span></Link></div></article>)}</div>{shown.length===0&&<p className="empty-results">ამ კატეგორიაში სადემონსტრაციო პროექტები ჯერ არ არის.</p>}</section>

</>;
}
