import { APIError, type CollectionConfig, type PayloadRequest } from 'payload';
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { actions, sections, can, isSuper, permitted, superField } from './access';
import { rememberSession, sessionLogin, sessionRefresh } from './session-policy';
import { auditChange, auditDelete } from './hooks';

async function lockUsers(req: PayloadRequest) {
 const transactionID = await req.transactionID;
 const tx = transactionID && (req.payload.db as unknown as PostgresAdapter).sessions[String(transactionID)]?.db;
 if (!tx) throw new APIError('მომხმარებლის ცვლილება ტრანზაქციას მოითხოვს',503);
 await tx.execute(sql`SELECT pg_advisory_xact_lock(746381923)`);
}
async function protectLast(req: PayloadRequest, id: string | number) {
 const current=await req.payload.findByID({collection:'users',id,req,overrideAccess:true,depth:0});
 if(current.role==='super-admin' && current.active){
  const others=await req.payload.count({collection:'users',req,overrideAccess:true,where:{and:[{role:{equals:'super-admin'}},{active:{equals:true}},{id:{not_equals:id}}]}});
  if(others.totalDocs===0)throw new APIError('ბოლო აქტიური სუპერ ადმინისტრატორის წაშლა ან დაქვეითება დაუშვებელია',400);
 }
}
function validatePassword(password:unknown){
 if(typeof password!=='string'||password.length<8||password.length>1024||!password.trim())throw new APIError('პაროლი უნდა შეიცავდეს 8–1024 სიმბოლოს',400);
}
export const Users: CollectionConfig = {
 endpoints:[sessionLogin,sessionRefresh],
 slug:'users',labels:{singular:'მომხმარებელი',plural:'მომხმარებლები'},
 admin:{useAsTitle:'username',group:'ადმინისტრირება',defaultColumns:['username','role','active']},
 auth:{loginWithUsername:{allowEmailLogin:false,requireEmail:true},forgotPassword:{expiration:30*60*1000,minRequestInterval:60*1000},maxLoginAttempts:5,lockTime:15*60*1000,tokenExpiration:2*60*60,useSessions:true,removeTokenFromResponses:true,cookies:{secure:process.env.NODE_ENV==='production',sameSite:'Lax'}},
 access:{
  admin:({req})=>req.user?.active===true,
  create:can('users','create'),
  read:({req})=>permitted(req.user,'users','read') || (req.user?.active ? {id:{equals:req.user.id}} : false),
  update:({req})=>permitted(req.user,'users','update') || (req.user?.active ? {id:{equals:req.user.id}} : false),
  delete:can('users','delete'),
 },
 hooks:{
  beforeOperation:[async ({operation,req,args})=>{
   const options=args as {data?:{password?:unknown};disableEmail?:boolean};
   if(operation==='forgotPassword'&&!process.env.SMTP_HOST&&!(options.disableEmail&&isSuper(req.user)))throw new APIError('პაროლის აღდგენის ელფოსტა ჯერ არ არის ჩართული. მიმართეთ ადმინისტრატორს.',503);
   if(operation==='resetPassword'){validatePassword(options.data?.password);req.context.cmsPasswordReset=true;}
   if(['create','update','delete'].includes(operation))await lockUsers(req);
  }],
  beforeValidate:[({data,req,operation,originalDoc})=>{
   if(!data)return data;
   if(data.password!==undefined)validatePassword(data.password);
   // Native reset passes an existing stored user, not editable role fields.
   if(req.context.cmsPasswordReset){if(!data.active)throw new APIError('აღდგენის მოთხოვნა დაუშვებელია',403);return data;}
   if(!req.context.bootstrap && !isSuper(req.user)){
    if(operation==='create' && (data.role && data.role!=='viewer' || data.permissions?.length))throw new APIError('უფლებების მინიჭება დაუშვებელია',403);
    if(operation==='update' && (data.role!==undefined && data.role!==originalDoc?.role || data.permissions!==undefined || data.active!==undefined && data.active!==originalDoc?.active))throw new APIError('უფლებების შეცვლა დაუშვებელია',403);
   }
   return data;
  }],
  beforeChange:[async ({data,operation,originalDoc,req})=>{
   if(operation==='create' && !req.user){
    if(!req.context.bootstrap)throw new APIError('საჯარო რეგისტრაცია დაუშვებელია',403);
    const count=await req.payload.count({collection:'users',req,overrideAccess:true});
    if(count.totalDocs!==0)throw new APIError('პირველი ადმინისტრატორი უკვე შექმნილია',403);
    data.role='super-admin';data.active=true;
   }
   if(operation==='update' && originalDoc && (data.role && data.role!=='super-admin' || data.active===false))await protectLast(req,originalDoc.id);
   if(data.active===false){data.sessions=[];data.sessionPolicies=[];}
   return data;
  }],
  beforeDelete:[async ({id,req})=>{await protectLast(req,id);}],
  beforeLogin:[({user})=>{if(!user.active)throw new APIError('მომხმარებლის სახელი ან პაროლი არასწორია',401);return user;}],
  afterLogin:[rememberSession],afterChange:[auditChange],afterDelete:[auditDelete],
 },
 fields:[
  {name:'sessionPolicies',type:'json',hidden:true,access:{read:()=>false,create:()=>false,update:()=>false}},
  {name:'username',type:'text',label:'მომხმარებლის სახელი',required:true,index:true,unique:true},
  {name:'role',type:'select',label:'როლი',defaultValue:'viewer',required:true,saveToJWT:true,access:{create:superField,update:superField},options:[{label:'სუპერ ადმინისტრატორი',value:'super-admin'},{label:'ადმინისტრატორი',value:'administrator'},{label:'რედაქტორი',value:'editor'},{label:'ავტორი',value:'author'},{label:'მნახველი',value:'viewer'}]},
  {name:'active',type:'checkbox',label:'აქტიური',defaultValue:true,saveToJWT:true,access:{create:superField,update:superField}},
  {name:'permissions',type:'array',validate:(value:unknown)=>!Array.isArray(value)||new Set(value.map(v=>v.section)).size===value.length||'სექციის უფლებები არ უნდა მეორდებოდეს',label:'სექციების უფლებები (ცარიელი = როლის ნაგულისხმევი)',access:{create:superField,update:superField},fields:[{name:'section',type:'select',label:'სექცია',required:true,options:sections.map(value=>({value,label:({'news':'სიახლეები','projects':'პროექტები','project-categories':'კატეგორიები','slides':'სლაიდერი','media':'მედია','testimonials':'გამოხმაურებები','statistics':'სტატისტიკა','about':'კომპანიის შესახებ','site-settings':'პარამეტრები','homepage':'მთავარი გვერდი','users':'მომხმარებლები'})[value]}))},{name:'actions',type:'select',label:'მოქმედებები',hasMany:true,options:actions.map(value=>({value,label:({read:'ნახვა',create:'დამატება',update:'შეცვლა',publish:'გამოქვეყნება',delete:'წაშლა'})[value]}))}]},
 ],
};
