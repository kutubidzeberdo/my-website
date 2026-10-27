import { APIError, loginOperation, refreshOperation, type Endpoint, type PayloadRequest, type SanitizedCollectionConfig, type CollectionAfterLoginHook } from 'payload';
import { generatePayloadCookie } from 'payload/shared';

export const REGULAR_SECONDS=2*60*60;
export const REMEMBER_SECONDS=30*24*60*60;
type Policy={sessionID:string;expiresAt:string};
function trustedOrigin(req:PayloadRequest){
 const origin=req.headers.get('origin');
 if(!origin||!req.payload.config.csrf.includes(origin))throw new APIError('მოთხოვნა დაუშვებელია',403);
}
async function loginData(req:PayloadRequest){
 if(!req.headers.get('content-type')?.startsWith('application/json'))throw new APIError('მონაცემების ფორმატი არასწორია',415);
 if(req.data)return req.data;
 const reader=req.body?.getReader();if(!reader)throw new APIError('მონაცემები არასწორია',400);
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw new APIError('მოთხოვნა ძალიან დიდია',413);}chunks.push(value);}
 try{const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();req.data=data;return data;}catch{throw new APIError('მონაცემები არასწორია',400);}
}
function scopedCollection(req:PayloadRequest,seconds:number){
 const collection=req.payload.collections.users;
 return {...collection,config:{...collection.config,auth:{...collection.config.auth,tokenExpiration:seconds}} as SanitizedCollectionConfig};
}
function response(req:PayloadRequest,auth:SanitizedCollectionConfig['auth'],token:string,body:Record<string,unknown>){
 return Response.json(body,{headers:{'Set-Cookie':generatePayloadCookie({collectionAuthConfig:auth,cookiePrefix:req.payload.config.cookiePrefix,token}),'Cache-Control':'no-store'}});
}
export const rememberSession:CollectionAfterLoginHook=async({req,user})=>{
 if(req.context.pmcRememberMe){
  const latest=user.sessions?.at(-1);
  if(!latest?.id)throw new APIError('სესიის შექმნა ვერ მოხერხდა',503);
  const activeSessions=new Set((user.sessions||[]).map((s:{id:string})=>s.id));
  const policies:Policy[]=(Array.isArray(user.sessionPolicies)?user.sessionPolicies:[]).filter((p:Policy)=>activeSessions.has(p.sessionID)&&new Date(p.expiresAt).getTime()>Date.now());
  policies.push({sessionID:latest.id,expiresAt:new Date(latest.expiresAt).toISOString()});
  await req.payload.db.updateOne({collection:'users',id:user.id,data:{sessionPolicies:policies},req,returning:false});
 }
 return user;
};
export const sessionLogin:Endpoint={path:'/session-login',method:'post',handler:async(req)=>{
 trustedOrigin(req);
 const data=await loginData(req);
 const username=data.username,password=data.password;
 if(typeof username!=='string'||username.length>200||typeof password!=='string'||password.length>1024)throw new APIError('მომხმარებლის სახელი ან პაროლი არასწორია',400);
 const remember=data.rememberMe===true;
 req.context.pmcRememberMe=remember;
 const collection=scopedCollection(req,remember?REMEMBER_SECONDS:REGULAR_SECONDS);
 const result=await loginOperation({collection,req,data:{username,password},overrideAccess:false});
 if(!result.token)throw new APIError('სესიის შექმნა ვერ მოხერხდა',503);
 return response(req,collection.config.auth,result.token,{user:result.user,exp:result.exp});
}};
export const sessionRefresh:Endpoint={path:'/refresh-token',method:'post',handler:async(req)=>{
 trustedOrigin(req);
 if(!req.user?.active)throw new APIError('სესია დასრულდა',401);
 const stored=await req.payload.findByID({collection:'users',id:req.user.id,overrideAccess:true,showHiddenFields:true,select:{sessionPolicies:true},req});
 const policies=(Array.isArray(stored.sessionPolicies)?stored.sessionPolicies:[]) as Policy[];
 const sid=(req.user as typeof req.user & {_sid?:string})._sid;
 const policy=policies.find(p=>p.sessionID===sid);
 let seconds=REGULAR_SECONDS;
 if(policy){seconds=Math.floor((new Date(policy.expiresAt).getTime()-Date.now())/1000);if(seconds<=0)throw new APIError('სესია დასრულდა',401);seconds=Math.min(seconds,REMEMBER_SECONDS);}
 const collection=scopedCollection(req,seconds);
 const result=await refreshOperation({collection,req});
 if(!result.refreshedToken)throw new APIError('სესიის განახლება ვერ მოხერხდა',401);
 return response(req,collection.config.auth,result.refreshedToken,{user:result.user,exp:result.exp});
}};
