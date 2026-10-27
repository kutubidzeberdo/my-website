import InternalPage from '@/components/InternalPage';
import Image from 'next/image';
import {recordMetadata} from '@/lib/site-metadata';
import {publicAbout,publicMedia,mediaURL} from '@/lib/cms-public';
import CMSRichText from '@/components/CMSRichText';
export async function generateMetadata(){const about=await publicAbout();return recordMetadata(about.seo?.title||about.title,about.seo?.description||about.title,mediaURL(await publicMedia(),about.seo?.image)||about.image,'/about');}
export default async function AboutPage(){const about=await publicAbout();return <InternalPage><main className="about-content wrap" lang="ka"><h1>{about.title}</h1>{about.image&&<Image src={about.image} alt={about.title} width={1440} height={850} sizes="88vw" style={{maxWidth:'100%',height:'auto'}}/>}<CMSRichText content={about.content}/></main></InternalPage>;}
