import Image from 'next/image';
import {notFound} from 'next/navigation';
import InternalPage from '@/components/InternalPage';
import {PageHeading,PhotoGallery,YoutubeVideo,FacebookShareButton} from '@/components/ContentElements';
import {newsRecords,formatDate} from '@/lib/records';
import {absoluteUrl,recordMetadata} from '@/lib/site-metadata';
export function generateStaticParams(){return newsRecords.map(n=>({slug:n.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const n=newsRecords.find(n=>n.id===slug);return n?recordMetadata(n.title.ka,n.body.ka,n.image,`/news/${n.id}`,true):{title:'ვერ მოიძებნა'};}
export default async function NewsDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const n=newsRecords.find(n=>n.id===slug);if(!n)notFound();return <InternalPage><main className="record-detail wrap"><a className="back-link" href="/news">← სიახლეებზე დაბრუნება</a><PageHeading>{n.title.ka}</PageHeading><time dateTime={n.date}>{formatDate(n.date)}</time><Image className="record-hero" src={n.image} alt={n.title.ka} width={1440} height={850} sizes="88vw" priority/><div className="article-body"><p>{n.body.ka}</p></div><PhotoGallery photos={n.gallery}/><YoutubeVideo id={n.youtubeId}/><FacebookShareButton url={absoluteUrl(`/news/${n.id}`)}/><section className="related-records"><h2>სხვა სიახლეები</h2>{newsRecords.filter(r=>r.id!==n.id).map(r=><a key={r.id} href={`/news/${r.id}`}>{r.title.ka} ↗</a>)}</section></main></InternalPage>;}
