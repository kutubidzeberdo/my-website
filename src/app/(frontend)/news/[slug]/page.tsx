import Image from 'next/image';
import {notFound,permanentRedirect} from 'next/navigation';
import InternalPage from '@/components/InternalPage';
import {PageHeading,PhotoGallery,YoutubeVideo,FacebookShareButton} from '@/components/ContentElements';
import {formatDate} from '@/lib/records';
import {publicNews,publicMedia,mediaURL} from '@/lib/cms-public';
import CMSRichText,{CMSVideo} from '@/components/CMSRichText';
import {absoluteUrl,recordMetadata} from '@/lib/site-metadata';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const newsRecords=await publicNews();const n=newsRecords.find(n=>n.id===slug||n.aliases?.includes(slug));return n?recordMetadata(n.seo?.title||n.title.ka,n.seo?.description||n.body.ka,mediaURL(await publicMedia(),n.seo?.image)||n.image,`/news/${n.id}`,true):{title:'ვერ მოიძებნა'};}
export default async function NewsDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const newsRecords=await publicNews();const n=newsRecords.find(n=>n.id===slug);if(!n){const alias=newsRecords.find(r=>r.aliases?.includes(slug));if(alias)permanentRedirect(`/news/${alias.id}`);notFound();}return <InternalPage><main className="record-detail wrap"><a className="back-link" href="/news">← სიახლეებზე დაბრუნება</a><PageHeading>{n.title.ka}</PageHeading><time dateTime={n.date}>{formatDate(n.date)}</time><Image className="record-hero" src={n.image} alt={n.title.ka} width={1440} height={850} sizes="88vw" priority/><div className="article-body">{n.content?<CMSRichText content={n.content}/>:<p>{n.body.ka}</p>}</div><PhotoGallery photos={n.gallery}/><CMSVideo url={n.videoURL}/><FacebookShareButton url={absoluteUrl(`/news/${n.id}`)}/><section className="related-records"><h2>სხვა სიახლეები</h2>{newsRecords.filter(r=>r.id!==n.id).map(r=><a key={r.id} href={`/news/${r.id}`}>{r.title.ka} ↗</a>)}</section></main></InternalPage>;}
