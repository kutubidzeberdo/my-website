import {initI18n} from '@payloadcms/translations';
import type {Payload} from 'payload';
import {AdminLanguages as ClientLanguages} from './BilingualFields';
/** Supply the fully resolved native dictionaries, including Lexical feature translations. */
export async function AdminLanguages({children,payload}:{children:React.ReactNode;payload:Payload}){
 const dictionaries=Object.fromEntries(await Promise.all((['ka','en'] as const).map(async language=>{const i18n=await initI18n({config:payload.config.i18n,context:'client',language:language as 'en'});return [language,{translations:i18n.translations,dateFNSKey:i18n.dateFNSKey}];})));
 return <ClientLanguages dictionaries={dictionaries} cookiePrefix={payload.config.cookiePrefix||'payload'}>{children}</ClientLanguages>;
}
