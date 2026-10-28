'use client';
import {PublicLanguage} from './PublicLanguage';
import {useRouter} from 'next/navigation';
import {useEffect,useState,type ReactNode} from 'react';
import Header from './Header';
import Footer from './Footer';
import {PreviewNotice,ScrollToTop} from './PageUtilities';
import type {Language} from '@/data/content';
export default function InternalPage({children}:{children:ReactNode|((language:Language)=>ReactNode)}){
 const router=useRouter();
  const [language,setLanguage]=useState<Language>('ka');const [ready,setReady]=useState(false);
 useEffect(()=>{if(localStorage.getItem('adjara-language')==='en')setLanguage('en');setReady(true);},[]);
 useEffect(()=>{document.documentElement.lang=language;if(ready){localStorage.setItem('adjara-language',language);const changed=!document.cookie.split('; ').includes('adjara-language='+language);document.cookie='adjara-language='+language+'; Path=/; Max-Age=31536000; SameSite=Lax';if(changed)router.refresh();}},[language,ready,router]);
 return <PublicLanguage.Provider value={language}><div className="about-header"><Header language={language} onLanguageChange={setLanguage} internalPage/></div>{typeof children==='function'?children(language):children}<PreviewNotice/><Footer language={language}/><ScrollToTop/></PublicLanguage.Provider>;
}
