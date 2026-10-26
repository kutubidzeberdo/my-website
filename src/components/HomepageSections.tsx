'use client';
import Image from 'next/image';
import Link from 'next/link';
import Testimonials from './Testimonials';
import Statistics from './Statistics';
import ProjectPortfolio from './ProjectPortfolio';
import type { Language } from '@/data/content';
import { homepage as h, projects, news } from '@/data/homepage';
function Icon({type}:{type:number}) {const paths=['M5 3h10l4 4v14H5z M14 3v6h6 M8 13h8 M8 17h5','M3 20 10 4l4 16 M6 14h10 M15 4l6 16 M16 13h4','M3 17h18 M5 17v-6a7 7 0 0 1 14 0v6 M10 5v7 M14 5v7 M3 21h18','M4 5h16v16H4z M8 3v4 M16 3v4 M8 13l3 3 6-6'];return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[type%4]}/></svg>}
export default function HomepageSections({language}:{language:Language}) {
 // Fixed month names avoid differences in server/browser Intl locale data.
 const date = (value: string) => {
   const locale = 'ka-GE' as const;
   const timeZone = 'UTC';
   const parsed = new Date(`${value}T00:00:00.000Z`);
   const months = {
     'ka-GE': ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'],
     'en-GB': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
   };
   // Numeric parts use an explicit Gregorian calendar, digits and UTC zone.
   const parts = new Intl.DateTimeFormat('ka-GE', {
     day: 'numeric', month: 'numeric', year: 'numeric',
     calendar: 'gregory', numberingSystem: 'latn', timeZone,
   }).formatToParts(parsed);
   const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)!.value;
   return `${part('day')} ${months[locale][Number(part('month')) - 1]}${locale === 'ka-GE' ? ',' : ''} ${part('year')}`;
 };
 return <>
 <section className="process-section section-space"><div className="wrap"><div className="process-heading"><div><p className="section-label">{h.processLabel[language]}</p><h2>{h.processTitle[language]}</h2><p className="section-description">{h.processIntro[language]}</p></div><div className="process-banner"><Image src="/images/construction.jpg" alt="" fill sizes="(max-width: 600px) 88vw, 35vw"/></div></div><div className="process-grid">{h.stages.map(([title,description],i)=><article className="process-card" key={i}><div className="process-card-top"><span className="process-icon"><Icon type={i}/></span><span className="process-number">0{i+1}</span></div><div className="process-rule"/><h3>{title[language]}</h3><p>{description[language]}</p></article>)}</div></div></section>
 <ProjectPortfolio language={language}/>
 <Testimonials language={language}/>
 <Statistics language={language}/>
 <section className="progress-section section-space wrap" id="progress"><p className="section-label">{h.progressLabel[language]}</p><div className="homepage-section-heading"><h2><Link href="/projects/ongoing">{h.progressTitle[language]}</Link></h2><Link className="homepage-view-all" href="/projects/ongoing">ყველას ნახვა</Link></div><div className="progress-grid">{projects.filter(p=>p.statusCode==='ongoing').slice(0,2).map(p=><article className="progress-card" key={p.id}><div className="progress-photo"><Image src={p.image} alt="" fill sizes="(max-width: 600px) 88vw, 42vw"/></div><div className="progress-content"><h3>{p.name[language]}</h3><div className="progress-label"><span>{p.status[language].replace(' · DEMO', '')}</span><strong>{p.progress}%</strong></div><progress max="100" value={p.progress} aria-label={`${p.name[language]}`}/><p>{h.phase[language]}: {p.phase?.[language]}</p><p className="update-date">{h.updated[language]}: <time dateTime="2026-10-20">{date('2026-10-20')}</time></p><Link className="text-button" href={`/projects/${p.id}`}>{h.preview[language]} <span aria-hidden="true">↗</span></Link></div></article>)}</div></section>
 <section className="news-section section-space" id="media"><div className="wrap"><p className="section-label">{h.newsLabel[language]}</p><div className="homepage-section-heading"><h2>{h.newsTitle[language]}</h2><Link className="homepage-view-all" href="/news">ყველას ნახვა</Link></div><div className="news-grid">{[...news].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3).map(n=><article className="news-card" key={n.id}><div className="news-photo"><Image src={n.image} alt="" fill sizes="(max-width: 600px) 88vw, 28vw"/></div><div className="news-content"><time dateTime={n.date}>{date(n.date)}</time><h3>{n.title[language]}</h3><p>{n.body[language]}</p><Link className="text-button" href={`/news/${n.id}`}>{h.read[language]} <span aria-hidden="true">↗</span></Link></div></article>)}</div></div></section>

 </>;
}
