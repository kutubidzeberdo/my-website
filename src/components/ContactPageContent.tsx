'use client';
import {contactUI} from '@/data/contact-ui';
import {useCMS} from './CMSContext';
import {usePublicLanguage} from './PublicLanguage';
import ContactForm from './ContactForm';
export default function ContactPageContent(){const {settings:contact}=useCMS();const language=usePublicLanguage();const t=contactUI[language];return <main className="contact-page wrap" lang={language}><h1>{t.title}</h1><div className="contact-page-grid"><section className="contact-details" aria-label={t.details}><dl><dt>{t.phone}</dt><dd><a href={contact.telephoneHref}>{contact.phone}</a></dd><dt>{t.email}</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd><dt>{t.address}</dt><dd>{contact.address}</dd></dl></section><ContactForm/></div></main>;}
