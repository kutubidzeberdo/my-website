import path from 'node:path';
import sharp from 'sharp';
import { buildConfig, type Config } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { professionalEditor } from './src/cms/editor/config';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { s3Storage } from '@payloadcms/storage-s3';
import { Users } from './src/cms/users';
import { AuditLogs, Categories, Media, News, Projects, Slides, Statistics, Testimonials } from './src/cms/collections';
import { About, Homepage, SiteSettings } from './src/cms/globals';
import { ka } from './src/cms/translations';
import { gallery, video } from './src/cms/fields';

if(!process.env.PAYLOAD_SECRET || !process.env.DATABASE_URL)throw new Error('CMS requires DATABASE_URL and PAYLOAD_SECRET in the local or encrypted runtime environment.');
const serverURL=process.env.CMS_SERVER_URL||process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';
export default buildConfig({
 secret:process.env.PAYLOAD_SECRET,
 serverURL,csrf:[serverURL],cors:[serverURL],
 admin:{theme:'light',dateFormat:'dd MMM yyyy, HH:mm',toast:{duration:4500,position:'bottom-right',limit:3},user:'users',importMap:{baseDir:path.resolve('.')},components:{providers:['/src/cms/admin/NotificationPolicy#NotificationPolicy'],Nav:'/src/cms/admin/Navigation#Navigation',graphics:{Logo:'/src/cms/admin/Brand#Brand',Icon:'/src/cms/admin/Brand#BrandIcon'},views:{login:{Component:'/src/cms/admin/Login#Login',path:'/login'},dashboard:{Component:'/src/cms/admin/Dashboard#Dashboard'}}},meta:{titleSuffix:'— PMC ადმინისტრირება'}},
 // Upstream language union omits Georgian; runtime supports custom dictionaries.
 i18n:{supportedLanguages:{ka},fallbackLanguage:'ka',translations:{ka:{lexical:ka.translations.lexical}}} as unknown as Config['i18n'],
 localization:{locales:[{label:'ქართული',code:'ka'},{label:'English',code:'en'}],defaultLocale:'ka',fallback:true},
 db:postgresAdapter({pool:{connectionString:process.env.DATABASE_URL},push:false,disableCreateDatabase:true,migrationDir:path.resolve('src/cms/migrations')}),
 collections:[Users,Media,Categories,News,Projects,Slides,Testimonials,Statistics,AuditLogs],
 globals:[About,SiteSettings,Homepage],
 editor:professionalEditor,
 sharp,
 upload:{limits:{fileSize:10*1024*1024}},
 typescript:{outputFile:path.resolve('src/cms/payload-types.ts')},
 plugins:process.env.S3_BUCKET?[s3Storage({collections:{media:true},bucket:process.env.S3_BUCKET,config:{region:process.env.S3_REGION||'us-east-1',endpoint:process.env.S3_ENDPOINT,credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID!,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY!}}})]:[],
 // No development email logger: reset tokens must never be emitted into logs.
 email:process.env.SMTP_HOST?nodemailerAdapter({defaultFromAddress:process.env.SMTP_FROM_ADDRESS!,defaultFromName:'PMC',transportOptions:{host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',requireTLS:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}}}):()=>({name:'disabled-until-configured',defaultFromAddress:'no-reply@localhost',defaultFromName:'PMC',sendEmail:async()=>{throw new Error('CMS recovery email delivery is not configured. Contact the super administrator.');}}),
});
