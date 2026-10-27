'use client';
import { useEffect, useRef, useState } from 'react';
import { emptyContact, validateContact, type ContactFields } from '@/lib/contact-validation';
import {useCMS} from './CMSContext';
export default function ContactForm() {
 const {settings:contact}=useCMS();
 const form = useRef<HTMLFormElement>(null);
 const [fields, setFields] = useState<ContactFields>({...emptyContact});
 const [errors, setErrors] = useState<Record<string,string>>({});
 const [state, setState] = useState<'idle'|'loading'|'success'|'error'>('idle');
 const [message, setMessage] = useState('');
 const [available, setAvailable] = useState<boolean|null>(null);
 const pending = useRef(false);
 const submissionId=useRef<string|null>(null);
 useEffect(()=>{const controller=new AbortController();fetch('/api/contact',{signal:controller.signal}).then(r=>r.json()).then(data=>setAvailable(data.available===true)).catch(()=>{if(!controller.signal.aborted)setAvailable(false);});return()=>controller.abort();},[]);
 const update = (key: keyof ContactFields, value: string|boolean) => {submissionId.current=null;setFields(previous=>({...previous,[key]:value}));};
 async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();if(pending.current||state==='success')return;
  const checked=validateContact(fields);setErrors(checked.errors);setMessage('');
  if(Object.keys(checked.errors).length){setState('error');requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());return;}
  if(available!==true){setState('error');setMessage('ელფოსტის გაგზავნა ჯერ არ არის ჩართული. წერილი არ გაგზავნილა.');return;}
  submissionId.current??=crypto.randomUUID();
  pending.current=true;setState('loading');
  try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':submissionId.current!},body:JSON.stringify(checked.data)});const result=await response.json();if(!response.ok){setErrors(result.errors||{});throw new Error(result.error||'გაგზავნა ვერ დადასტურდა.');}setState('success');setMessage(result.message);}catch(error){setState('error');setMessage(error instanceof Error?error.message:'გაგზავნა ვერ დადასტურდა.');}finally{pending.current=false;}
 }
 return <div className="contact-form" lang="ka"><p className="contact-availability" role="status">{available===null?'სერვისის შემოწმება…':available?'შეავსეთ ფორმა დაკავშირებისთვის.':'ფორმა დროებით მიუწვდომელია: ელფოსტის სერვისი ჯერ არ არის ჩართული. წერილი არ გაიგზავნება.'}</p><form ref={form} noValidate onSubmit={submit}>
 {(['name','email','phone','subject','message'] as const).map((key,i)=><label className="contact-field" key={key}>{['სახელი და გვარი','ელფოსტა','ტელეფონი (არასავალდებულო)','თემა','შეტყობინება'][i]}{key!=='phone'?' *':''}{key==='message'?<textarea name={key} required maxLength={5000} rows={5} value={fields[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={e=>update(key,e.target.value)}/>:<input name={key} type={key==='email'?'email':key==='phone'?'tel':'text'} autoComplete={key==='name'?'name':key==='email'?'email':key==='phone'?'tel':'off'} required={key!=='phone'} maxLength={key==='name'?120:key==='email'?254:key==='phone'?40:200} value={fields[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={e=>update(key,e.target.value)}/>}{errors[key]&&<span className="field-error" id={`error-${key}`}>{errors[key]}</span>}</label>)}
 <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={e=>update('website',e.target.value)}/></label>
 <label className="consent"><input type="checkbox" required checked={fields.consent} aria-invalid={!!errors.consent} aria-describedby={errors.consent?'contact-privacy consent-error':'contact-privacy'} onChange={e=>update('consent',e.target.checked)}/>ვეთანხმები ჩემი საკონტაქტო მონაცემების დამუშავებას ამ შეტყობინებაზე პასუხის გასაცემად.</label><p id="contact-privacy" className="privacy-note">სახელი, ელფოსტა, ტელეფონი და შეტყობინება გადაეცემა კომპანიას და გაგზავნის სერვისს მხოლოდ მოთხოვნის დასამუშავებლად. ნუ მიუთითებთ სენსიტიურ მონაცემებს. მონაცემების შესახებ კითხვებისთვის: {contact.email}.</p>{errors.consent&&<p className="field-error" id="consent-error">{errors.consent}</p>}
 {message&&<p role={state==='error'?'alert':'status'} className={state==='error'?'field-error':''}>{message}</p>}<button className="button" type="submit" disabled={state==='loading'||state==='success'||available!==true}>{state==='loading'?'იგზავნება…':state==='success'?'მიღებულია გასაგზავნად':'გაგზავნა'}</button>
 </form></div>;
}
