import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
let input='';
for await (const chunk of process.stdin) {input+=chunk;if(input.length>8192)throw new Error('Input too large');}
const {getPayload}=await import('payload');
const {default:config}=await import('../../payload.config');
const payload=await getPayload({config});
try{
 const {username,email,password}=JSON.parse(input);
 await payload.create({collection:'users',data:{username,email,password,role:'super-admin',active:true},overrideAccess:true,context:{bootstrap:true}});
 console.log('Administrator created.');
}finally{await payload.destroy();}

// Lexical keeps worker handles; the one-shot CLI has completed cleanup.
process.exit(0);
