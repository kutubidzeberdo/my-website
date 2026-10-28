'use client';
import {createContext,useContext,useMemo,useState,useEffect} from 'react';
import {adminEnglish} from '../admin-labels';
import {RenderFields,ArrayField,useFormFields,useFieldPath,useTranslation,useConfig,ConfigProvider,TranslationProvider} from '@payloadcms/ui';
import {getTranslation} from '@payloadcms/translations';
import type {GroupFieldClientProps,ArrayFieldClientProps} from 'payload';
const LanguageContext=createContext<{language:'ka'|'en';setLanguage:(value:'ka'|'en')=>void}>({language:'ka',setLanguage:()=>{}});
/** The server localization config stays enabled. Only the native admin locale widget is disabled. */
const FieldScope=createContext<'ka'|'en'|'both'>('both');
const InterfaceContext=createContext<{change:(language:'ka'|'en')=>void}>({change:()=>{}});
export function AdminLanguages({children,dictionaries,cookiePrefix}:{children:React.ReactNode;dictionaries:Record<string,{translations:any;dateFNSKey:any}>;cookiePrefix:string}){
 const [language,setLanguage]=useState<'ka'|'en'>('ka');const {config}=useConfig();const native=useTranslation();const [interfaceLanguage,setInterfaceLanguage]=useState(native.i18n.language==='en'?'en':'ka');
 const interfaceConfig=useMemo(()=>({...config,localization:false as const}),[config]);
 const value=useMemo(()=>({language,setLanguage}),[language]);
 const change=(next:'ka'|'en')=>{document.cookie=`${cookiePrefix}-lng=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;setInterfaceLanguage(next);};
 const dictionary=dictionaries[interfaceLanguage];
 return <ConfigProvider config={interfaceConfig}><TranslationProvider language={interfaceLanguage} fallbackLang={'ka' as 'en'} languageOptions={native.languageOptions} translations={dictionary.translations} dateFNSKey={dictionary.dateFNSKey} switchLanguageServerAction={async next=>change(next as 'ka'|'en')}><InterfaceContext.Provider value={{change}}><LanguageContext.Provider value={value}><div data-content-language={language} style={{display:'contents'}}>{children}</div></LanguageContext.Provider></InterfaceContext.Provider></TranslationProvider></ConfigProvider>;
}
export function InterfaceLanguage(){const {config,setConfig}=useConfig();useEffect(()=>{if(config.localization)setConfig({...config,localization:false});},[config,setConfig]);const {change}=useContext(InterfaceContext);const {i18n}=useTranslation();return <label className="pmc-interface-language">{i18n.language==='en'?'Interface language':'ინტერფეისის ენა'} <select aria-label={i18n.language==='en'?'Interface language':'ინტერფეისის ენა'} value={i18n.language} onChange={e=>change(e.target.value as 'ka'|'en')}><option value="ka">ქართული</option><option value="en">English</option></select></label>;}

export function ContentTabs(){const {language,setLanguage}=useContext(LanguageContext);return <div className="pmc-content-languages" role="tablist" aria-label="Content language">{(['ka','en'] as const).map(locale=><button type="button" key={locale} role="tab" aria-selected={language===locale} onClick={()=>setLanguage(locale)}>{locale==='ka'?'ქართული':'English'}</button>)}</div>;}
/** Presentational group only: hidden fields remain mounted in the same native form. */
export function GeorgianOnly({field,path,schemaPath,indexPath,permissions,readOnly}:GroupFieldClientProps){
 const {language}=useContext(LanguageContext);const scope=useContext(FieldScope);const livePath=useFieldPath()||path;
 if(scope==='en')return null;
 return <div className="pmc-georgian-fields" hidden={scope!=='ka'&&language!=='ka'}><RenderFields forceRender fields={field.fields} parentPath={livePath} parentSchemaPath={schemaPath||path} parentIndexPath={indexPath||''} permissions={permissions??true} readOnly={readOnly}/></div>;
}
export function LocalizedField({field,path,schemaPath,permissions,readOnly}:GroupFieldClientProps){
 const {language}=useContext(LanguageContext);const scope=useContext(FieldScope);const livePath=useFieldPath()||path;
 return <div className="pmc-localized-field">{(['ka','en'] as const).filter(locale=>scope==='both'||scope===locale).map(locale=><div key={locale} hidden={(scope==='both'&&language!==locale)||(locale==='en'&&field.admin?.custom?.pmcEnglish!==true)} data-content-locale={locale}><RenderFields forceRender fields={field.fields.filter(f=>'name' in f&&f.name===locale)} parentPath={livePath} parentSchemaPath={schemaPath||path} parentIndexPath="" permissions={permissions===true?true:permissions?.fields??true} readOnly={readOnly}/></div>)}</div>;
}
/** English edits row text, never the shared row structure, IDs or ordering. */
export function TranslationArray(props:ArrayFieldClientProps){
 const {field,path,schemaPath,permissions,readOnly}=props;const livePath=useFieldPath()||path;const {language}=useContext(LanguageContext);const scope=useContext(FieldScope);const {i18n}=useTranslation();
 const rows=useFormFields(([fields])=>fields[livePath]?.rows)||[];
 return <>{scope!=='en'&&<div hidden={scope==='both'&&language!=='ka'}><FieldScope.Provider value="ka"><ArrayField {...props} forceRender/></FieldScope.Provider></div>}{scope!=='ka'&&<div hidden={scope==='both'&&language!=='en'}><FieldScope.Provider value="en">{rows.length>0&&<section className="pmc-translation-rows">{field.label&&<h3>{getTranslation(field.label,i18n)}</h3>}{rows.map((row,index)=><div className="pmc-translation-row" key={row.id}><RenderFields forceRender fields={field.fields.filter(f=>!f.admin?.custom?.pmcGeorgianOnly&&(!('name' in f)||f.name!=='id'))} parentPath={`${livePath}.${index}`} parentSchemaPath={schemaPath||path} parentIndexPath="" permissions={permissions===true?true:permissions?.fields??true} readOnly={readOnly}/></div>)}</section>}</FieldScope.Provider></div>}</>;
}

export function useAdminLabel(){const {i18n}=useTranslation();return (value:string)=>i18n.language==='en'?(adminEnglish[value]||value):value;}
export function AdminText({children}:{children:string}){const label=useAdminLabel();return <>{label(children)}</>;}
