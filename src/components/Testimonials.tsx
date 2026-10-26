'use client';
import Image from 'next/image';
import {sampleReview} from '@/data/contact';
import {useState} from 'react';
import type {Language} from '@/data/content';
import {testimonials} from '@/data/ui';
export default function Testimonials({language}:{language:Language}){
 const [index,setIndex]=useState(0);const t=testimonials.ka;
 return <section className="transparency-feature testimonials"><div className="wrap transparency-grid"><div className="transparency-copy"><p className="section-label">{t.label}</p><h2>{t.title}</h2><p>{t.intro}</p></div><div className="testimonial-panel"><span className="quote-mark" aria-hidden="true">”</span><div className="testimonial-person"><Image src="/images/testimonial-portrait.jpg" width={96} height={96} sizes="96px" alt="საილუსტრაციო პორტრეტი — არ არის კომპანიის კლიენტი"/><div><h3>საილუსტრაციო პერსონა</h3><p>გამოხმაურების ნიმუში</p></div></div><div aria-live="polite"><p className="testimonial-quote">{index===0?sampleReview:testimonials.ka.quotes[index]}</p></div><p className="testimonial-note">{t.note}</p><div className="testimonial-controls"><button aria-label={t.previous} onClick={()=>setIndex((index+t.quotes.length-1)%t.quotes.length)}>←</button><span>{index+1} / {t.quotes.length}</span><button aria-label={t.next} onClick={()=>setIndex((index+1)%t.quotes.length)}>→</button></div></div></div></section>;
}
