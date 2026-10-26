'use client';
import {useEffect,useState,type ReactNode} from 'react';
import Header from './Header';
import Footer from './Footer';
import {PreviewNotice,ScrollToTop} from './PageUtilities';
import type {Language} from '@/data/content';
export default function InternalPage({children}:{children:ReactNode|((language:Language)=>ReactNode)}){
 const [language,setLanguage]=useState<Language>('ka');const [ready,setReady]=useState(false);
 useEffect(()=>{if(localStorage.getItem('adjara-language')==='en')setLanguage('en');setReady(true);},[]);
 useEffect(()=>{document.documentElement.lang='ka';if(ready)localStorage.setItem('adjara-language',language);},[language,ready]);
 return <><div className="about-header"><Header language={language} onLanguageChange={setLanguage} internalPage/></div>{typeof children==='function'?children(language):children}<PreviewNotice/><Footer language={language}/><ScrollToTop/></>;
}
