import {cookies} from 'next/headers';
import type {Language} from '@/data/content';
export type DetailSearchParams=Promise<{lang?:string|string[]}>;
export async function detailLanguage(searchParams?:DetailSearchParams):Promise<Language> {
  const selected=(await searchParams)?.lang;
  if(selected==='ka'||selected==='en')return selected;
  return (await cookies()).get('adjara-language')?.value==='en'?'en':'ka';
}
