'use client';
import {PublicLanguage} from './PublicLanguage';
import {useRouter} from 'next/navigation';
import {useEffect,useState,type ReactNode} from 'react';
import Header from './Header';
import Footer from './Footer';
import {PreviewNotice,ScrollToTop} from './PageUtilities';
import type {Language} from '@/data/content';
export default function InternalPage({children,routeLanguage,detailLanguage}:{children:ReactNode|((language:Language)=>ReactNode);routeLanguage?:Language;detailLanguage?:Language}){
 const router=useRouter();
  const [language,setLanguage]=useState<Language>(routeLanguage||detailLanguage||'ka');const [ready,setReady]=useState(false);
 useEffect(()=>{if(routeLanguage||detailLanguage)setLanguage((routeLanguage||detailLanguage)!);else if(localStorage.getItem('adjara-language')==='en')setLanguage('en');setReady(true);},[routeLanguage,detailLanguage]);
 useEffect(()=>{document.documentElement.lang=language;if(ready){localStorage.setItem('adjara-language',language);const changed=!document.cookie.split('; ').includes('adjara-language='+language);document.cookie='adjara-language='+language+'; Path=/; Max-Age=31536000; SameSite=Lax';if(changed)router.refresh();}},[language,ready,router]);
 return <PublicLanguage.Provider value={language}><div className="about-header"><Header language={language} onLanguageChange={next=>{if(routeLanguage)router.push(`/${next}/privacy`);else if(detailLanguage){const url=new URL(window.location.href);url.searchParams.set('lang',next);window.location.assign(url.pathname+url.search);}else setLanguage(next);}} internalPage/></div>{typeof children==='function'?children(language):children}<PreviewNotice/><Footer language={language}/><ScrollToTop/></PublicLanguage.Provider>;
}
