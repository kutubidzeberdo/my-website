'use client';
import InternalPage from './InternalPage';
import {useCMS} from './CMSContext';
import {privacy} from '@/data/privacy';
import type {Language} from '@/data/content';

export default function PrivacyPage({language}:{language:Language}) {
  const t=privacy[language];
  const {settings}=useCMS();
  return <InternalPage routeLanguage={language}>
    <main className="about-content wrap" lang={language}>
      <h1>{t.title}</h1>
      <p>{t.introduction}</p>
      <section aria-labelledby="privacy-contact">
        <h2 id="privacy-contact">{t.contactTitle}</h2>
        <p>{settings.companyName}<br/>{t.contactText}</p>
        <p><a href={`mailto:${settings.email}`}>{settings.email}</a><br/>
          <a href={settings.telephoneHref}>{settings.phone}</a><br/>{settings.address}<br/>
          <a href="/contact">{t.contactLink}</a></p>
      </section>
      {t.sections.map(section=><section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
      <p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">{t.googleLink}</a></p>
    </main>
  </InternalPage>;
}
