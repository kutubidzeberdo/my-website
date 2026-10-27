'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import HomepageSections from './HomepageSections';
import Header from './Header';
import Footer from './Footer';
import { PreviewNotice, ScrollToTop } from './PageUtilities';
import { type Language } from '@/data/content';
import {useCMS} from './CMSContext';
import type {publicHomepage} from '@/lib/cms-public';
export default function Website({data}:{data:Awaited<ReturnType<typeof publicHomepage>>}) {
  const [language, setLanguage] = useState<Language>('ka');
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const {settings}=useCMS();const t=settings.copy;const slides=data.slides;const total=slides.length;const current=slides[slide%Math.max(1,total)];
  useEffect(() => { const saved = localStorage.getItem('adjara-language'); if (saved === 'en') setLanguage('en'); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true); setReady(true); }, []);
  useEffect(() => { document.documentElement.lang = 'ka'; if (ready) localStorage.setItem('adjara-language', language); }, [language, ready]);
  useEffect(() => { if (paused) return; const timer = setInterval(() => setSlide(s => (s + 1) % Math.max(1,total)), 7000); return () => clearInterval(timer); }, [paused,total]);
  return <>
    <a className="skip-link" href="#main">შინაარსზე გადასვლა</a>
    <main id="main">
      <section className="hero" id="home" aria-label={'რჩეული პროექტები'}>
        <div className="hero-image"><Image src={current?.image||'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1440" height="850"/%3E'} alt="" fill priority sizes="100vw" quality={85}/></div>
        <div className="shade"/>
        <Header language={language} onLanguageChange={setLanguage}/>
        <div className="hero-content wrap" aria-live={paused ? 'polite' : 'off'}>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{current?.title||''}</h1>
          <div className="rule"><span/></div>
          <p className="hero-description">{current?.description||''}</p>
          <a className="button hero-cta" href={current?.buttonURL||'/projects'}>{current?.buttonText||t.explore}<span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-bottom wrap"><div className="slide-controls"><button onClick={() => setSlide((slide + total - 1) % Math.max(1,total))} aria-label={t.previous}>←</button><span>{String(total?slide+1:0).padStart(2,'0')}<span className="total"> / {String(total).padStart(2,'0')}</span></span><button onClick={() => setPaused(!paused)} aria-label={paused ? t.play : t.pause}>{paused ? '▷' : 'Ⅱ'}</button><button onClick={() => setSlide((slide + 1) % Math.max(1,total))} aria-label={t.next}>→</button></div></div>
        <div className="slide-index">{slides.map((s, i) => <button key={s.id} aria-label={`${i + 1}: ${s.title}`} aria-current={i === slide ? 'true' : undefined} onClick={() => setSlide(i)}><span>0{i + 1}</span>{s.title}</button>)}</div>
      </section>
      <HomepageSections language={language} data={data}/>
    </main>
    <PreviewNotice/>
    <Footer language={language}/>
    <ScrollToTop/>
  </>;
}
