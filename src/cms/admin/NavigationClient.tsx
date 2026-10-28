'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {PREFERENCE_KEYS} from 'payload/shared';
import {usePathname,useSearchParams} from 'next/navigation';
import {useNav,usePreferences,Logout,useTranslation} from '@payloadcms/ui';
import {adminEnglish} from '../admin-labels';
import {Brand} from './Brand';
import {Icon} from './Icon';
export type NavItem={group:string;key:string;label:string;icon:string;href:string};
export function NavigationClient({items}:{items:NavItem[]}){
 const {i18n}=useTranslation();const label=(v:string)=>i18n.language==='en'?(adminEnglish[v]||v):v;
 const {navOpen,navRef,hydrated,shouldAnimate,setNavOpen}=useNav();const pathname=usePathname();const search=useSearchParams();const {getPreference}=usePreferences();
 useEffect(()=>{if(!hydrated)return;let disposed=false;const desktop=window.matchMedia('(min-width:1025px)'),wide=window.matchMedia('(min-width:1441px)');const apply=async()=>{if(!desktop.matches)return;const pref=await getPreference<{open?:boolean}>(PREFERENCE_KEYS.NAV);requestAnimationFrame(()=>{if(!disposed&&desktop.matches)setNavOpen(pref?.open??true);});};void apply();desktop.addEventListener('change',apply);wide.addEventListener('change',apply);return()=>{disposed=true;desktop.removeEventListener('change',apply);wide.removeEventListener('change',apply);};},[hydrated,getPreference,setNavOpen]);
 function closeMobile(){if(window.matchMedia('(max-width: 1024px)').matches)setNavOpen(false);}
 return <aside className={`nav pmc-nav ${navOpen?'nav--nav-open':''} ${hydrated?'nav--nav-hydrated':''} ${shouldAnimate?'nav--nav-animate':''}`} inert={!navOpen||undefined} aria-label="ადმინისტრირების ნავიგაცია"><div ref={navRef} className="nav__scroll pmc-nav-scroll">
  <Link href="/admin" className="pmc-nav-brand" onClick={closeMobile}><Brand/></Link><div className="pmc-workspace-label">{label('კონტენტის მართვა')}</div>
  <Link className={`pmc-nav-link ${pathname==='/admin'?'is-active':''}`} href="/admin" aria-current={pathname==='/admin'?'page':undefined} onClick={closeMobile}><Icon name="dashboard"/><span>{label('მიმოხილვა')}</span></Link>
  {[...new Set(items.map(i=>i.group))].map(group=><details className="pmc-nav-group" key={group} open><summary>{label(group)}<span aria-hidden="true">⌄</span></summary><div>{items.filter(i=>i.group===group).map(item=>{const status=[...search.entries()].find(([key])=>key.endsWith('[status][equals]'))?.[1];const active=['ongoing','completed'].includes(item.key)?pathname.startsWith('/admin/collections/projects')&&status===item.key:pathname.startsWith(item.href.split('?')[0])&&!(item.key==='projects'&&['ongoing','completed'].includes(status||''));return <Link key={item.key} href={item.href} className={`pmc-nav-link ${active?'is-active':''}`} aria-current={active?'page':undefined} onClick={closeMobile}><Icon name={item.icon}/><span>{label(item.label)}</span></Link>;})}</div></details>)}
  <div className="pmc-nav-bottom"><span>Adjara PMC</span><Logout/></div>
 </div></aside>;
}
