// Owner-run only. Not imported by the website. No credentials are printed.
import {createServer} from 'node:http';
import {randomBytes,createHash} from 'node:crypto';
import {readFile,writeFile,chmod} from 'node:fs/promises';
const scope='https://www.googleapis.com/auth/gmail.send';
if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET)throw new Error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first.');
const state=randomBytes(32).toString('base64url'),verifier=randomBytes(48).toString('base64url');
let redirect;let handling=false;
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,redirect);
 if(url.pathname!=='/oauth2callback'||url.searchParams.get('state')!==state){res.writeHead(400);res.end('Invalid authorization callback.');return;}
 if(handling){res.writeHead(409);res.end('Already processing.');return;}handling=true;
 try{
  const code=url.searchParams.get('code');if(!code)throw new Error('Authorization not granted.');
  const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,code,code_verifier:verifier,grant_type:'authorization_code',redirect_uri:redirect})});
  const token=await response.json();if(!response.ok||!token.refresh_token||token.scope?.split(' ').some(s=>s!==scope)||!token.scope?.split(' ').includes(scope))throw new Error('Token exchange failed or unexpected scopes.');
  let env=await readFile('.env.local','utf8');const line=`GOOGLE_REFRESH_TOKEN=${JSON.stringify(token.refresh_token)}`;env=/^GOOGLE_REFRESH_TOKEN=.*$/m.test(env)?env.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m,line):env+'\n'+line+'\n';await writeFile('.env.local',env,{mode:0o600});await chmod('.env.local',0o600);
  res.setHeader('Content-Type','text/plain; charset=utf-8');res.end('Authorization complete. The refresh token was saved to .env.local. Close this tab.');console.log('Refresh token saved securely to .env.local. Restart the local site.');
 }catch{res.writeHead(400);res.end('Authorization failed. No token was displayed. Check the account, client and consent settings.');console.error('Authorization failed; no credentials were logged.');process.exitCode=1;}finally{clearTimeout(timeout);server.close();}
});
server.listen(0,'127.0.0.1',()=>{redirect=`http://127.0.0.1:${server.address().port}/oauth2callback`;const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:redirect,response_type:'code',scope,access_type:'offline',prompt:'consent',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',login_hint:'ajarapmcpr@gmail.com'}).toString();console.log('Open this Google authorization URL in your own browser and sign in as ajarapmcpr@gmail.com:\n'+url);});
const timeout=setTimeout(()=>{console.error('Authorization timed out.');server.close();},5*60*1000);
