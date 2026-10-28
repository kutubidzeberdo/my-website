// Schema-only child process. Never load .env.local or connect to a database/S3.
import {getPayload} from 'payload';
import {getTableConfig} from 'drizzle-orm/pg-core';
const mode=process.argv[2];if(!['local','s3'].includes(mode))throw Error('Expected local or s3 schema mode');
const unreachable=new URL('postgresql://127.0.0.1');unreachable.port='9';unreachable.pathname='/schema_only_no_connection';
process.env.DATABASE_URL=unreachable.toString();
process.env.PAYLOAD_SECRET='schema-only-disposable-key-not-a-production-secret';
Object.assign(process.env,{NODE_ENV:'production'});
for(const key of ['S3_BUCKET','S3_ENDPOINT','S3_REGION','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY','SMTP_HOST'])delete process.env[key];
if(mode==='s3')Object.assign(process.env,{S3_BUCKET:'schema-only-no-resource',S3_ENDPOINT:'https://invalid.example',S3_REGION:'us-east-1',S3_ACCESS_KEY_ID:'schema-only',S3_SECRET_ACCESS_KEY:'schema-only'});
const {default:config}=await import('../../payload.config');const c=await config;
c.telemetry=false;c.typescript.autoGenerate=false;c.admin.importMap.autoGenerate=false;
const payload=await getPayload({config:c,disableDBConnect:true,disableOnInit:true});
const db=payload.db as any;
const tables=Object.fromEntries(Object.entries(db.tables).map(([name,table])=>[name,getTableConfig(table as any).columns.map(column=>({name:column.name,type:column.getSQLType(),notNull:column.notNull,primaryKey:column.primary,hasDefault:column.hasDefault})).sort((a,b)=>a.name.localeCompare(b.name))]));
const media=payload.collections.media.config;
const legacyDoc={filename:'legacy.jpg',_objectKey:null,sizes:{thumbnail:{filename:'legacy-400x300.jpg'},card:{filename:'legacy-card-960x640.webp'}}};
const sizes=media.fields.find(field=>'name'in field&&field.name==='sizes') as any;
const urlFields=[media.fields.find(field=>'name'in field&&field.name==='url'),...['thumbnail','card'].map(name=>sizes.fields.find((field:any)=>field.name===name).fields.find((field:any)=>field.name==='url'))] as any[];
const filenames=['legacy.jpg','legacy-400x300.jpg','legacy-card-960x640.webp'];const legacyURLs:string[]=[];
for(const [index,field]of urlFields.entries()){let value='/api/media/file/'+filenames[index];for(const hook of field.hooks?.afterRead||[])value=await hook({collection:media,data:legacyDoc,originalDoc:legacyDoc,value,req:{payload}});legacyURLs.push(value);}

await new Promise<void>(resolve=>process.stdout.write(JSON.stringify({tables,legacyURLs,adapter:media.upload.adapter||'local',disableLocalStorage:!!media.upload.disableLocalStorage,objectKeyField:media.fields.find(field=>'name'in field&&field.name==='_objectKey')||null,hasStorageProxy:!!media.upload.handlers?.length,accessRead:typeof media.access.read==='function'})+'\n',()=>resolve()));
process.exit(0);
