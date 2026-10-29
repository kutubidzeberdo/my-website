import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { validateContact } from '@/lib/contact-validation';
import { gmailConfigured, sendGmail, GmailError } from '@/lib/gmail';
export const runtime = 'nodejs';
const attempts = new Map<string, { count: number; expires: number }>();
const LIMIT = 16 * 1024;
const configured = gmailConfigured;
function expectedOrigin(request: NextRequest): string | null {
  // Behind App Platform's proxy nextUrl may contain the internal service origin.
  // Use the same explicit public URL as Payload; never trust forwarded host headers.
  const publicURL = process.env.CMS_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!publicURL) return request.nextUrl.origin;
  try { return new URL(publicURL).origin; } catch { return null; }
}
const submissions = new Map<string, {expires:number; fingerprint:string; pending:boolean; accepted:boolean}>();
export function GET() { return NextResponse.json({ available: configured() }, { headers: { 'Cache-Control': 'no-store' } }); }
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== expectedOrigin(request)) return NextResponse.json({ error: 'მოთხოვნა დაუშვებელია.' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'მონაცემების ფორმატი არასწორია.' }, { status: 415 });
  if (Number(request.headers.get('content-length')) > LIMIT) return NextResponse.json({ error: 'შეტყობინება ძალიან დიდია.' }, { status: 413 });
  // Trust a proxy-provided IP only when the hosting proxy is explicitly configured to overwrite this header.
  const client = process.env.CONTACT_TRUST_PROXY === 'true' ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'shared' : 'shared';
  const key = createHash('sha256').update(client).digest('hex');
  const now = Date.now();
  for (const [entry, value] of attempts) if (value.expires <= now) attempts.delete(entry);
  const bucket = attempts.get(key) || { count: 0, expires: now + 10 * 60 * 1000 };
  if (bucket.count >= 5 || attempts.size >= 10000 && !attempts.has(key)) return NextResponse.json({ error: 'ძალიან ბევრი მცდელობაა. სცადეთ მოგვიანებით.' }, { status: 429, headers: { 'Retry-After': '600' } });
  bucket.count++; attempts.set(key, bucket);
  let value: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing body');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value: chunk } = await reader.read(); if (done) break; size += chunk.byteLength; if (size > LIMIT) { await reader.cancel(); return NextResponse.json({ error: 'შეტყობინება ძალიან დიდია.' }, { status: 413 }); } chunks.push(chunk); }
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return NextResponse.json({ error: 'მონაცემების ფორმატი არასწორია.' }, { status: 400 }); }
  const { data, errors } = validateContact(value);
  if (data.website) return NextResponse.json({ error: 'მოთხოვნა ვერ დამუშავდა.' }, { status: 400 });
  if (Object.keys(errors).length) return NextResponse.json({ error: 'გადაამოწმეთ შევსებული ველები.', errors }, { status: 400 });
  if (!configured()) return NextResponse.json({ error: 'ელფოსტის გაგზავნა ჯერ არ არის ჩართული. წერილი არ გაგზავნილა.' }, { status: 503 });
  const submissionId=request.headers.get('Idempotency-Key');
  if(!submissionId||!/^[-a-zA-Z0-9]{16,80}$/.test(submissionId))return NextResponse.json({error:'მოთხოვნის იდენტიფიკატორი არასწორია.'},{status:400});
  for(const [id,entry] of submissions)if(entry.expires<=Date.now())submissions.delete(id);
  const fingerprint=createHash('sha256').update(JSON.stringify(data)).digest('hex');
  const existing=submissions.get(submissionId);
  if(existing){return NextResponse.json({error:existing.accepted?'ეს მოთხოვნა უკვე მიღებულია გასაგზავნად.':'ამ მოთხოვნის გაგზავნა უკვე დამუშავებულია ან მიმდინარეობს. ავტომატურად არ განმეორდება.'},{status:409});}
  // Also reject identical content under a new key during this process-local window.
  if([...submissions.values()].some(entry=>entry.fingerprint===fingerprint))return NextResponse.json({error:'იდენტური მოთხოვნა უკვე დამუშავებულია. ავტომატურად არ განმეორდება.'},{status:409});
  if(submissions.size>=10000)return NextResponse.json({error:'სერვისი დროებით დატვირთულია.'},{status:503});
  const entry={expires:Date.now()+10*60*1000,fingerprint,pending:true,accepted:false};submissions.set(submissionId,entry);
  try {
    await sendGmail(data);entry.pending=false;entry.accepted=true;
    return NextResponse.json({ message: 'Gmail API-მ წერილი გასაგზავნად მიიღო. ეს არ ადასტურებს მის საბოლოო მიწოდებას.' });
  } catch(error) {
    entry.pending=false;
    const quota=error instanceof GmailError&&error.kind==='quota';
    const authorization=error instanceof GmailError&&error.kind==='authorization';
    return NextResponse.json({error:quota?'Gmail-ის გაგზავნის ლიმიტი დროებით ამოიწურა.':authorization?'Gmail-ის ავტორიზაცია მიუწვდომელია. დაუკავშირდით საიტის ადმინისტრატორს.':'Gmail-მა გაგზავნა ვერ დაადასტურა. ავტომატურად ხელახლა არ გაგზავნილა.'},{status:quota?429:authorization?503:502});
  }
}
