import type { Metadata } from 'next';
import '../globals.css';
import {getPublicShell} from '@/lib/cms-public';
import {CMSProvider} from '@/components/CMSContext';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const {settings}=await getPublicShell();return {metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||process.env.CMS_SERVER_URL||'http://localhost:3000'),title:`${settings.companyName} | Adjara Project Management`,description:'აჭარის ინფრასტრუქტურული პროექტები — Adjara infrastructure project management. Demonstration website.'};}
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const shell=await getPublicShell();return <html lang="ka"><body><CMSProvider value={shell}>{children}</CMSProvider></body></html>; }
