import Link from 'next/link';
import {redirect} from 'next/navigation';
import type {AdminViewServerProps,CollectionSlug,Where} from 'payload';
import {permitted,type Section} from '../access';
import {Icon} from './Icon';
const metrics:{collection:CollectionSlug;section:Section;label:string;icon:string;where?:Where;href?:string}[]=[
 {collection:'news',section:'news',label:'ყველა სიახლე',icon:'news'},
 {collection:'news',section:'news',label:'გამოქვეყნებული სიახლე',icon:'news',where:{_status:{equals:'published'}}},
 {collection:'projects',section:'projects',label:'ყველა პროექტი',icon:'projects'},
 {collection:'projects',section:'projects',label:'მიმდინარე პროექტი',icon:'ongoing',where:{status:{equals:'ongoing'}},href:'/admin/collections/projects?where[status][equals]=ongoing'},
 {collection:'projects',section:'projects',label:'დასრულებული პროექტი',icon:'projects',where:{status:{equals:'completed'}}},
 {collection:'media',section:'media',label:'მედია ფაილი',icon:'media'},
 {collection:'slides',section:'slides',label:'აქტიური სლაიდი',icon:'slides',where:{active:{equals:true}}},
 {collection:'users',section:'users',label:'მომხმარებელი',icon:'users'},
];
export async function Dashboard({initPageResult}:AdminViewServerProps){
 const {req}=initPageResult;if(!req.user?.active)redirect('/admin/login');
 const cards=await Promise.all(metrics.filter(m=>permitted(req.user,m.section,'read')).map(async m=>({...m,count:(await req.payload.count({collection:m.collection,where:m.where,req,overrideAccess:false})).totalDocs})));
 const quick=[{section:'news' as Section,label:'ახალი სიახლის დამატება',icon:'news'},{section:'projects' as Section,label:'ახალი პროექტის დამატება',icon:'projects'},{section:'media' as Section,label:'ახალი ფოტოს ატვირთვა',icon:'media'}].filter(a=>permitted(req.user,a.section,'create'));
 return <div className="pmc-dashboard"><header className="pmc-dashboard-heading"><div><p className="pmc-eyebrow">აჭარის პროექტების მართვის კომპანია</p><h1>თქვენი სამუშაო სივრცე</h1><p>კონტენტი, პროექტები და კომპანიის სიახლეები — ერთ სივრცეში.</p></div><span className="pmc-system-badge"><span/>კონტენტის მართვის სისტემა</span></header>
  <section className="pmc-metrics" aria-label="მონაცემების მიმოხილვა">{cards.map(m=><Link key={m.label} className="pmc-metric" href={m.href||`/admin/collections/${m.collection}`}><div className="pmc-metric-top"><span className="pmc-metric-icon"><Icon name={m.icon} size={23}/></span><Icon name="arrow" size={17}/></div><strong>{m.count}</strong><span>{m.label}</span><small>მონაცემები თქვენი წვდომის ფარგლებში</small></Link>)}</section>
  {!!quick.length&&<section className="pmc-quick-panel"><div><p className="pmc-eyebrow">სწრაფი მოქმედებები</p><h2>რას დაამატებთ დღეს?</h2><p>დაიწყეთ ახალი ჩანაწერი ან შეარჩიეთ ფოტო ბიბლიოთეკიდან.</p></div><div className="pmc-quick-actions">{quick.map(a=><Link href={`/admin/collections/${a.section}/create`} key={a.section}><Icon name={a.icon}/>{a.label}<Icon name="arrow" size={17}/></Link>)}</div></section>}
  <footer className="pmc-dashboard-note"><Icon name="lock" size={17}/><span>თქვენ ხედავთ მხოლოდ თქვენი ანგარიშისთვის ხელმისაწვდომ სექციებს.</span></footer>
 </div>;
}
