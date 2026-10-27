import InternalPage from '@/components/InternalPage';
import ContactForm from '@/components/ContactForm';
import {getPublicShell} from '@/lib/cms-public';
export default async function ContactPage(){const {settings:contact}=await getPublicShell();
 return <InternalPage><main className="contact-page wrap" lang="ka"><h1>დაგვიკავშირდით</h1><div className="contact-page-grid"><section className="contact-details" aria-label="საკონტაქტო ინფორმაცია"><dl><dt>ტელეფონი</dt><dd><a href={contact.telephoneHref}>{contact.phone}</a></dd><dt>ელფოსტა</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd><dt>მისამართი</dt><dd>{contact.address}</dd></dl></section><ContactForm/></div></main></InternalPage>;
}
