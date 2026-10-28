import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const {Client}=await import('pg');
const {execFileSync}=await import('node:child_process');
const {mkdirSync,writeFileSync}=await import('node:fs');
const client=new Client({connectionString:process.env.DATABASE_URL});await client.connect();
const tables=(await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name")).rows;
const snapshot:any={};for(const {table_name:t} of tables){snapshot[t]=(await client.query(`select * from "${t}" order by 1`)).rows;}
mkdirSync('.cms-backups',{recursive:true});const stamp=new Date().toISOString().replace(/[:.]/g,'-');const base=`.cms-backups/phase46-${stamp}`;
writeFileSync(base+'-before.json',JSON.stringify(snapshot),{mode:0o600});
execFileSync('pg_dump',['--dbname',process.env.DATABASE_URL!,'--format=custom','--file',base+'.dump'],{stdio:'pipe'});
const archive=execFileSync('pg_restore',['--list',base+'.dump'],{encoding:'utf8'});if(!archive.includes('TABLE DATA'))throw Error('Unreadable archive');
console.log(JSON.stringify({backup:base+'.dump',archiveEntries:archive.split('\n').length,counts:Object.fromEntries(Object.entries(snapshot).map(([k,v]:any)=>[k,v.length]))}));await client.end();
