'use client';
import Image from 'next/image';
import {useCMS} from './CMSContext';
import type {PublicTestimonial} from '@/lib/cms-model';
import {useState} from 'react';
import type {Language} from '@/data/content';

export default function Testimonials({language,records}:{language:Language;records:PublicTestimonial[]}){
 const [index,setIndex]=useState(0);const {testimonialsCopy:t}=useCMS();const current=records[index%Math.max(1,records.length)];if(!current)return null;
 return <section className="transparency-feature testimonials"><div className="wrap transparency-grid"><div className="transparency-copy"><p className="section-label">{t.label}</p><h2>{t.title}</h2><p>{t.intro}</p></div><div className="testimonial-panel"><span className="quote-mark" aria-hidden="true">”</span><div className="testimonial-person">{current.portrait&&<Image src={current.portrait} width={96} height={96} sizes="96px" alt={current.title}/> }<div><h3>{current.title}</h3><p>{current.position}</p></div></div><div aria-live="polite"><p className="testimonial-quote">{current.quote}</p></div><div className="testimonial-controls"><button aria-label={t.previous} onClick={()=>setIndex((index+records.length-1)%records.length)}>←</button><span>{index+1} / {records.length}</span><button aria-label={t.next} onClick={()=>setIndex((index+1)%records.length)}>→</button></div></div></div></section>;
}
