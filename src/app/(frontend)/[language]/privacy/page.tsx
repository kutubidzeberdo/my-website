import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import PrivacyPage from '@/components/PrivacyPage';
import {privacy} from '@/data/privacy';

type Props={params:Promise<{language:string}>};
function policyLanguage(language:string) {
  if(language!=='ka'&&language!=='en')notFound();
  return language;
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const language=policyLanguage((await params).language);
  return {title:`${privacy[language].title} | PMC`,alternates:{canonical:`/${language}/privacy`,languages:{ka:'/ka/privacy',en:'/en/privacy'}}};
}
export default async function Page({params}:Props) {
  return <PrivacyPage language={policyLanguage((await params).language)}/>;
}
