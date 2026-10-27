import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
nextEnv.loadEnvConfig(process.cwd());
const {getPayload}=await import('payload');const {default:config}=await import('../payload.config');const payload=await getPayload({config});
const credentials=JSON.parse(await readFile('.cms-backups/initial-admin.json','utf8'));
const admin={...(await payload.find({collection:'users',where:{username:{equals:credentials.username}},overrideAccess:true})).docs[0],collection:'users' as const};
const username=`recovery-${randomBytes(6).toString('hex')}`;const email=`${username}@example.com`;const original=randomBytes(24).toString('base64url');const replacement=randomBytes(24).toString('base64url');let id:number|undefined;
try{
 const user=await payload.create({collection:'users',data:{username,email,password:original,role:'viewer',active:true},user:admin,overrideAccess:false});id=user.id;
 // Privileged, offline Local API path only: no email is sent and no token logged.
 const identity={username,email};
 const token=await payload.forgotPassword({collection:'users',data:identity,disableEmail:true,req:{user:admin},overrideAccess:false});assert.ok(token);
 await assert.rejects(payload.resetPassword({collection:'users',data:{token:token!,password:'weak'},overrideAccess:false}));
 const reset=await payload.resetPassword({collection:'users',data:{token:token!,password:replacement},overrideAccess:false});assert.equal(reset.user.id,id);assert.equal(reset.token,undefined);
 await assert.rejects(payload.resetPassword({collection:'users',data:{token:token!,password:original},overrideAccess:false}));
 await assert.rejects(payload.login({collection:'users',data:{username,password:original}}));
 assert.equal((await payload.login({collection:'users',data:{username,password:replacement}})).user?.id,id);
 const expired=await payload.forgotPassword({collection:'users',data:identity,disableEmail:true,req:{user:admin},overrideAccess:false});
 // Internal auth fields correctly reject ordinary API updates; expire only this disposable fixture through the trusted DB adapter.
 await payload.db.updateOne({collection:'users',id,data:{resetPasswordExpiration:new Date(Date.now()-1000).toISOString()}});
 await assert.rejects(payload.resetPassword({collection:'users',data:{token:expired!,password:original},overrideAccess:false}));
 console.log('PASS native reset succeeds, rejects short passwords/reused/expired tokens, rejects old password and accepts the replacement; no email sent or token printed.');
}finally{if(id)await payload.delete({collection:'users',id,user:admin,overrideAccess:false});await payload.destroy();}
process.exit(0);
