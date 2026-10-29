'use client';
import { useEffect, useRef, useState } from 'react';
import { emptyContact, validateContact, type ContactFields } from '@/lib/contact-validation';
import {contactUI,contactServerStatus,contactFieldErrors,type ContactStatusKey,type ContactValidationKey} from '@/data/contact-ui';
import {usePublicLanguage} from './PublicLanguage';
import {useCMS} from './CMSContext';
import ContactSuccessToast from './ContactSuccessToast';
export default function ContactForm() {
 const {settings:contact}=useCMS();const language=usePublicLanguage();const t=contactUI[language];
 const form = useRef<HTMLFormElement>(null);
 const [fields, setFields] = useState<ContactFields>({...emptyContact});
 const [errors, setErrors] = useState<Record<string,ContactValidationKey>>({});
 const [state, setState] = useState<'idle'|'loading'|'error'>('idle');
 const [message, setMessage] = useState<ContactStatusKey|null>(null);
 const [successNotification,setSuccessNotification]=useState(0);
 const [available, setAvailable] = useState<boolean|null>(null);
 const pending = useRef(false);
 const submissionId=useRef<string|null>(null);
 useEffect(()=>{const controller=new AbortController();fetch('/api/contact',{signal:controller.signal}).then(r=>r.json()).then(data=>setAvailable(data.available===true)).catch(()=>{if(!controller.signal.aborted)setAvailable(false);});return()=>controller.abort();},[]);
 const update = (key: keyof ContactFields, value: string|boolean) => {submissionId.current=null;setFields(previous=>({...previous,[key]:value}));};
 async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();if(pending.current)return;
  const checked=validateContact(fields);setErrors(contactFieldErrors(checked.errors,checked.data));setMessage(null);
  if(Object.keys(checked.errors).length){setState('error');requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());return;}
  if(available!==true){setState('error');setMessage('disabled');return;}
  submissionId.current??=crypto.randomUUID();
  pending.current=true;setState('loading');
  try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':submissionId.current!},body:JSON.stringify(checked.data)});if(!response.ok){const result=await response.json();setErrors(contactFieldErrors(result.errors||{},checked.data));setState('error');setMessage(contactServerStatus(result.error));return;}setFields({...emptyContact});setErrors({});submissionId.current=null;setState('idle');setMessage(null);setSuccessNotification(value=>value+1);}catch{setState('error');setMessage('error');}finally{pending.current=false;}
 }
 return <div className="contact-form" lang={language}><p className="contact-availability" role="status">{t.states[available===null?'checking':available?'available':'unavailable']}</p><form ref={form} noValidate onSubmit={submit}>
 {(['name','email','phone','subject','message'] as const).map((key)=><label className="contact-field" key={key}>{t.labels[key]}{key!=='phone'?' *':''}{key==='message'?<textarea name={key} placeholder={t.placeholders[key]} required maxLength={5000} rows={5} value={fields[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={e=>update(key,e.target.value)}/>:<input name={key} placeholder={t.placeholders[key]} type={key==='email'?'email':key==='phone'?'tel':'text'} autoComplete={key==='name'?'name':key==='email'?'email':key==='phone'?'tel':'off'} required={key!=='phone'} maxLength={key==='name'?120:key==='email'?254:key==='phone'?40:200} value={fields[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={e=>update(key,e.target.value)}/>}{errors[key]&&<span className="field-error" id={`error-${key}`}>{t.validation[errors[key]]}</span>}</label>)}
 <label className="contact-honeypot" aria-hidden="true">{t.website}<input name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={e=>update('website',e.target.value)}/></label>
 <label className="consent"><input type="checkbox" required checked={fields.consent} aria-invalid={!!errors.consent} aria-describedby={errors.consent?'contact-privacy consent-error':'contact-privacy'} onChange={e=>update('consent',e.target.checked)}/>{t.consent}</label><p id="contact-privacy" className="privacy-note">{t.privacy} {contact.email}.</p>{errors.consent&&<p className="field-error" id="consent-error">{t.validation[errors.consent]}</p>}
 {message&&<p role={state==='error'?'alert':'status'} className={state==='error'?'field-error':''}>{t.states[message]}</p>}<button className="button" type="submit" disabled={state==='loading'||available!==true}>{state==='loading'?t.submitting:t.submit}</button>
 </form><ContactSuccessToast notification={successNotification} message={t.states.success} language={language}/></div>;
}
