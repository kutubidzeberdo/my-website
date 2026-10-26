"use client";
import { useState } from 'react';
import Image from 'next/image';
import { content, type Language } from '@/data/content';
export default function Header({ language, onLanguageChange, internalPage = false }: { language: Language; onLanguageChange: (language: Language) => void; internalPage?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const t = content[language];
  const links = internalPage ? ['/#home', '/about', '/projects', '/news', '/contact'] : ['#home', '/about', '/projects', '/news', '/contact'];
  return (<>
        <header className="header wrap">
          <a href={links[0]} className="brand" aria-label={t.company}><Image className="brand-logo" src="/images/company-logo.png" alt={t.company} width={3896} height={4162} priority sizes="53px"/><span lang="ka">{content.ka.short}<br/>{content.ka.second}</span></a>
          <button className="menu-toggle" aria-label={t.menu} aria-expanded={menu} aria-controls="navigation" onClick={() => setMenu(!menu)}>{menu ? '✕' : '☰'}</button>
          <nav id="navigation" aria-label={t.menu} className={menu ? 'navigation open' : 'navigation'}>{t.nav.map((label, i) => i===2 ? <div className={`projects-menu ${projectsOpen?'expanded':''}`} key={i} onKeyDown={e=>{if(e.key==='Escape'){setProjectsOpen(false);e.currentTarget.querySelector('button')?.focus();}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setProjectsOpen(false);}}><div className="projects-menu-heading"><a href={links[i]} onClick={()=>setMenu(false)}>{label}</a><button type="button" className="projects-toggle" aria-label="პროექტების ქვემენიუ" aria-expanded={projectsOpen} aria-controls="projects-submenu" onClick={()=>setProjectsOpen(!projectsOpen)}><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></button></div><div className="projects-submenu" id="projects-submenu"><a href="/projects/ongoing" onClick={()=>{setMenu(false);setProjectsOpen(false);}}>მიმდინარე</a><a href="/projects/completed" onClick={()=>{setMenu(false);setProjectsOpen(false);}}>დასრულებული</a></div></div> : <a key={i} href={links[i]} onClick={() => setMenu(false)}>{label}</a>)}</nav>
          <div className="header-actions"><a className="button contact-button" href="/contact">{t.contact}</a><div className="languages" aria-label="Language">{(['ka', 'en'] as const).map(l => <button key={l} lang={l} aria-pressed={language === l} onClick={() => onLanguageChange(l)}>{l.toUpperCase()}</button>)}</div></div>
        </header>
    </>
  );
}
