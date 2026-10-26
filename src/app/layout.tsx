import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'აჭარის პროექტების მართვის კომპანია | Adjara Project Management', description: 'აჭარის ინფრასტრუქტურული პროექტები — Adjara infrastructure project management. Demonstration website.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ka"><body>{children}</body></html>; }
