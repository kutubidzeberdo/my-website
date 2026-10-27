import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const base=process.env.CMS_TEST_URL||'http://localhost:3100';
const credentials=JSON.parse(await readFile('.cms-backups/initial-admin.json','utf8'));
let adminCookie='';const cleanup=[];let passed=0;
async function check(name,fn){await fn();passed++;console.log(`PASS ${name}`);}
async function request(path,{method='GET',data,cookie=adminCookie}={}){
 const r=await fetch(`${base}/api/${path}`,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),Origin:process.env.CMS_TEST_ORIGIN||'http://localhost:3000'},body:data?JSON.stringify(data):undefined});
 const text=await r.text();let json;try{json=JSON.parse(text);}catch{json={};}return {status:r.status,json,headers:r.headers,text};
}
const suffix=randomBytes(5).toString('hex');const password=randomBytes(24).toString('base64url');
try{
 await check('username login, HTTP-only cookie, no response token/hash/salt',async()=>{
  const r=await request('users/login',{method:'POST',data:{username:credentials.username,password:credentials.password},cookie:''});assert.equal(r.status,200);adminCookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/i);assert.equal(r.json.token,undefined);assert.ok(!('hash' in r.json.user));assert.ok(!('salt' in r.json.user));assert.ok(!('password' in r.json.user));
 });
 await check('email-only login is rejected',async()=>{assert.ok((await request('users/login',{method:'POST',cookie:'',data:{email:credentials.email,password:credentials.password}})).status>=400);});
 await check('short administrator passwords are rejected',async()=>{assert.equal((await request('users',{method:'POST',data:{username:`weak-${suffix}`,email:`weak-${suffix}@example.com`,password:'weak'}})).status,400);});
 await check('cross-origin authenticated writes are rejected',async()=>{const r=await fetch(`${base}/api/slides`,{method:'POST',headers:{Cookie:adminCookie,Origin:'https://untrusted.example','Content-Type':'application/json'},body:JSON.stringify({title:'Denied'})});assert.equal(r.status,403);});
 await check('anonymous writes and user listing denied',async()=>{assert.equal((await request('news',{method:'POST',data:{title:'Denied',slug:'denied'},cookie:''})).status,403);assert.equal((await request('users',{cookie:''})).status,403);});
 const users={};
 for(const role of ['viewer','editor','author']){
  const r=await request('users',{method:'POST',data:{username:`test-${role}-${suffix}`,email:`${role}-${suffix}@example.com`,password,role,active:true}});assert.equal(r.status,201,`create ${role}: ${r.text.slice(0,300)}`);cleanup.push(['users',r.json.doc.id]);
  const login=await request('users/login',{method:'POST',data:{username:`test-${role}-${suffix}`,password},cookie:''});assert.equal(login.status,200);users[role]={id:r.json.doc.id,cookie:login.headers.get('set-cookie').split(';')[0]};
 }
 await check('viewer cannot create content',async()=>{assert.equal((await request('slides',{method:'POST',data:{title:'No'},cookie:users.viewer.cookie})).status,403);});
 await check('editor cannot create users',async()=>{assert.equal((await request('users',{method:'POST',data:{username:'bad',email:'bad@example.com',password},cookie:users.editor.cookie})).status,403);});
 await check('self escalation and permission changes denied',async()=>{for(const data of [{role:'super-admin'},{permissions:[{section:'users',actions:['create','update']}]}])assert.equal((await request(`users/${users.viewer.id}`,{method:'PATCH',data,cookie:users.viewer.cookie})).status,403);});
 let draftID;
 await check('author can create own draft but cannot publish',async()=>{
  const r=await request('news',{method:'POST',cookie:users.author.cookie,data:{title:'CMS test draft',slug:`cms-test-${suffix}`,_status:'draft'}});assert.equal(r.status,201,r.text.slice(0,300));draftID=r.json.doc.id;cleanup.push(['news',draftID]);assert.equal(r.json.doc.author.id||r.json.doc.author,users.author.id);
  assert.equal((await request(`news/${draftID}`,{method:'PATCH',cookie:users.author.cookie,data:{_status:'published'}})).status,403);
 });
 await check('public draft read denied',async()=>{const r=await request(`news/${draftID}`,{cookie:''});assert.ok([403,404].includes(r.status));});
 await check('author cannot edit another author record',async()=>{const existing=await request('news?where[slug][equals]=planning');assert.equal((await request(`news/${existing.json.docs[0].id}`,{method:'PATCH',cookie:users.author.cookie,data:{title:'No'}})).status,403);});
 await check('validation rejects unsafe embeds and out of range progress',async()=>{
  const p=await request('projects',{method:'POST',data:{title:'Invalid',slug:`invalid-${suffix}`,progress:101,videoURL:'javascript:alert(1)'}});assert.ok([400,403].includes(p.status));
  const r=await request(`news/${draftID}`,{method:'PATCH',data:{content:{root:{type:'root',children:[{type:'link',fields:{url:'javascript:alert(1)'},children:[]}]}}}});assert.ok([400,403].includes(r.status));
 });
 await check('last active super administrator protected',async()=>{const me=await request('users/me');const id=me.json.user.id;for(const data of [{active:false},{role:'viewer'}])assert.equal((await request(`users/${id}`,{method:'PATCH',data})).status,400);assert.equal((await request(`users/${id}`,{method:'DELETE'})).status,400);});
 await check('five invalid attempts lock the account',async()=>{for(let i=0;i<5;i++)assert.ok((await request('users/login',{method:'POST',cookie:'',data:{username:`test-viewer-${suffix}`,password:'incorrect'}})).status>=400);assert.ok((await request('users/login',{method:'POST',cookie:'',data:{username:`test-viewer-${suffix}`,password}})).status>=400);});
 await check('deactivated account cannot log in or change content',async()=>{assert.equal((await request(`users/${users.editor.id}`,{method:'PATCH',data:{active:false}})).status,200);assert.ok((await request('users/login',{method:'POST',cookie:'',data:{username:`test-editor-${suffix}`,password}})).status>=400);assert.equal((await request('slides',{method:'POST',cookie:users.editor.cookie,data:{title:'No'}})).status,403);});
 await check('audit log is restricted',async()=>{assert.equal((await request('audit-logs',{cookie:users.author.cookie})).status,403);assert.equal((await request('audit-logs')).status,200);});
 await check('logout invalidates session',async()=>{assert.equal((await request('users/logout',{method:'POST',cookie:users.author.cookie})).status,200);assert.equal((await request('users/me',{cookie:users.author.cookie})).json.user,null);});

 await check('granular permission overrides are enforced',async()=>{
  const r=await request(`users/${users.viewer.id}`,{method:'PATCH',data:{permissions:[{section:'slides',actions:['read','create']}]}});assert.equal(r.status,200);
  // Lockout only blocks login; the existing session remains a valid viewer session.
  const created=await request('slides',{method:'POST',cookie:users.viewer.cookie,data:{title:'Granted create only'}});assert.equal(created.status,201);cleanup.push(['slides',created.json.doc.id]);
  assert.equal((await request(`slides/${created.json.doc.id}`,{method:'PATCH',cookie:users.viewer.cookie,data:{title:'Denied update'}})).status,403);
 });
 await check('all managed collections support create/update/delete',async()=>{
  for(const [collection,data] of [['slides',{title:'Test'}],['statistics',{title:'Test',value:0}],['testimonials',{title:'Test',quote:'Illustrative test'}],['project-categories',{title:'Test'}],['projects',{title:'Test',slug:`test-project-${suffix}`,status:'ongoing',progress:0,_status:'draft'}]]){
   const made=await request(collection,{method:'POST',data});assert.equal(made.status,201,`${collection} create`);const id=made.json.doc.id;cleanup.push([collection,id]);
   assert.equal((await request(`${collection}/${id}`,{method:'PATCH',data:{title:'Updated',...(collection==='projects'?{progress:100,status:'completed'}:{})}})).status,200);
   assert.equal((await request(`${collection}/${id}`,{method:'DELETE'})).status,200);cleanup.splice(cleanup.findIndex(x=>x[0]===collection&&x[1]===id),1);
  }
 });
 await check('upload validates bytes and names; media renders and deletes',async()=>{
  async function upload(bytes,type,name,cookie=adminCookie){const data=new FormData();data.set('_payload',JSON.stringify({alt:'Verification photo',title:'Test upload'}));data.set('file',new Blob([bytes],{type}),name);return fetch(`${base}/api/media`,{method:'POST',headers:{Cookie:cookie,Origin:process.env.CMS_TEST_ORIGIN||'http://localhost:3000'},body:data});}
  const rejected=await upload(Buffer.from('<svg onload="alert(1)"></svg>'),'image/jpeg','spoof.jpg');assert.ok([400,413,415].includes(rejected.status));
  const bytes=await readFile('public/images/arena.jpg');assert.equal((await upload(bytes,'image/jpeg','photo.jpg',users.viewer.cookie)).status,403);
  const good=await upload(bytes,'image/jpeg','../../photo.jpg');assert.equal(good.status,201);const {doc}=await good.json();cleanup.push(['media',doc.id]);assert.match(doc.filename,/^[0-9a-f-]+\.jpg$/);const rendered=await fetch(`${base}${new URL(doc.url,base).pathname}`,{headers:{Cookie:adminCookie,Origin:process.env.CMS_TEST_ORIGIN||'http://localhost:3000'}});assert.equal(rendered.status,200);assert.match(rendered.headers.get('content-type'),/image/);
 });
 console.log(`${passed} CMS API checks passed.`);
}finally{
 for(const [collection,id] of cleanup.reverse()){
  const r=await request(`${collection}/${id}`,{method:'DELETE'});
  if(r.status!==200)console.log(`Cleanup failed: ${collection}/${id}, status ${r.status}`);
 }
}
