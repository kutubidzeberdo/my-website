'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import HomepageSections from './HomepageSections';
import Header from './Header';
import Footer from './Footer';
import { PreviewNotice, ScrollToTop } from './PageUtilities';
import { content, slideImages, type Language } from '@/data/content';
export default function Website() {
  const [language, setLanguage] = useState<Language>('ka');
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const t = content[language];
  useEffect(() => { const saved = localStorage.getItem('adjara-language'); if (saved === 'en') setLanguage('en'); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true); setReady(true); }, []);
  useEffect(() => { document.documentElement.lang = 'ka'; if (ready) localStorage.setItem('adjara-language', language); }, [language, ready]);
  useEffect(() => { if (paused) return; const timer = setInterval(() => setSlide(s => (s + 1) % 4), 7000); return () => clearInterval(timer); }, [paused]);
  return <>
    <a className="skip-link" href="#main">შინაარსზე გადასვლა</a>
    <main id="main">
      <section className="hero" id="home" aria-label={'რჩეული პროექტები'}>
        <div className="hero-image"><Image src={slideImages[slide]} alt="" fill priority sizes="100vw" quality={85}/></div>
        <div className="shade"/>
        <Header language={language} onLanguageChange={setLanguage}/>
        <div className="hero-content wrap" aria-live={paused ? 'polite' : 'off'}>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.slides[slide][0]}</h1>
          <div className="rule"><span/></div>
          <p className="hero-description">{t.slides[slide][1]}</p>
          <a className="button hero-cta" href="#projects">{t.explore}<span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-bottom wrap"><div className="slide-controls"><button onClick={() => setSlide((slide + 3) % 4)} aria-label={t.previous}>←</button><span>0{slide + 1}<span className="total"> / 04</span></span><button onClick={() => setPaused(!paused)} aria-label={paused ? t.play : t.pause}>{paused ? '▷' : 'Ⅱ'}</button><button onClick={() => setSlide((slide + 1) % 4)} aria-label={t.next}>→</button></div></div>
        <div className="slide-index">{t.slides.map((s, i) => <button key={s[0]} aria-label={`${i + 1}: ${s[0]}`} aria-current={i === slide ? 'true' : undefined} onClick={() => setSlide(i)}><span>0{i + 1}</span>{s[0]}</button>)}</div>
      </section>
      <HomepageSections language={language}/>
    </main>
    <PreviewNotice/>
    <Footer language={language}/>
    <ScrollToTop/>
  </>;
}
