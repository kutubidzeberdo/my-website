'use client';
import {useEffect,useRef,useState} from 'react';
import {TextInput,useField,useFormFields,useDocumentInfo,useTranslation} from '@payloadcms/ui';
import type {TextFieldClientProps} from 'payload';
import {slugify} from '../slug-shared';
export function SlugField({path,readOnly,field}:TextFieldClientProps){
 const {id,collectionSlug}=useDocumentInfo();const {i18n}=useTranslation();const en=i18n.language==='en';const {value,setValue,showError,errorMessage}=useField<string>({path});const title=useFormFields(([f])=>String(f['bilingual_title.ka']?.value||(f.title?.value as any)?.ka||f.title?.value||''));const manual=useRef(false);const initial=useRef(value);const [overridden,setOverridden]=useState(false);
 useEffect(()=>{if(!id&&!manual.current&&title)setValue(slugify(title));},[title,id,setValue]);
 const changed=!!id&&!!initial.current&&initial.current!==value;
 return <div className="pmc-slug"><TextInput path={path} label={en?'Page URL (slug)':'გვერდის მისამართი (URL)'} required value={value||''} readOnly={readOnly} showError={showError} Error={showError?<p role="alert">{errorMessage}</p>:undefined} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{manual.current=true;setOverridden(true);setValue(e.target.value);}}/><p className="field-description">{en?'The final part of the page URL. It is generated from the Georgian title and can be edited manually.':'ეს არის გვერდის ბმულის ბოლო ნაწილი. ის ავტომატურად შეიქმნება სათაურიდან, მაგრამ სურვილის შემთხვევაში შეგიძლიათ შეცვალოთ.'}</p><div className="pmc-slug-preview">/{collectionSlug}/{slugify(value||'')} <button type="button" disabled={readOnly||!title} onClick={()=>{manual.current=false;setOverridden(false);setValue(slugify(title));}}>{en?'Regenerate from title':'სათაურიდან ხელახლა შექმნა'}</button></div>{overridden&&!id&&<small>{en?'Your manually entered URL will be preserved.':'ხელით მითითებული მისამართი შენარჩუნდება.'}</small>}{changed&&<p className="pmc-url-warning" role="status">{en?'The URL is changing. The old URL will redirect to the new one.':'მისამართი იცვლება. ძველი ბმული ავტომატურად გადამისამართდება ახალ მისამართზე.'}</p>}</div>;
}
