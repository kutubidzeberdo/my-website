'use client';
import {useState,type FormEvent} from 'react';
import {useAuth,useConfig} from '@payloadcms/ui';
import {Icon} from './Icon';
export function LoginForm(){
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');const {setUser}=useAuth();const {config}=useConfig();
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError('');const form=new FormData(event.currentTarget);
  try{const res=await fetch(`${config.routes.api}/users/session-login`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password'),rememberMe:form.get('rememberMe')==='on'})});
   if(!res.ok){setError(res.status===423?'ანგარიში დროებით დაბლოკილია. სცადეთ მოგვიანებით.':'მომხმარებლის სახელი ან პაროლი არასწორია.');return;}
   const data=await res.json();setUser({user:data.user,exp:data.exp});window.location.assign('/admin');
  }catch{setError('სერვერთან დაკავშირება ვერ მოხერხდა. სცადეთ ხელახლა.');}finally{setBusy(false);}
 }
 return <form className="pmc-login-form" onSubmit={submit} aria-busy={busy}>
  <label htmlFor="pmc-username">მომხმარებლის სახელი<span aria-hidden="true"> *</span></label><input id="pmc-username" name="username" autoComplete="username" required maxLength={200} disabled={busy}/>
  <label htmlFor="pmc-password">პაროლი<span aria-hidden="true"> *</span></label><div className="pmc-password-wrap"><input id="pmc-password" name="password" type={visible?'text':'password'} autoComplete="current-password" required maxLength={1024} disabled={busy}/><button className="pmc-password-toggle" type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'პაროლის დამალვა':'პაროლის ჩვენება'} aria-pressed={visible}><Icon name="eye"/></button></div>
  <div className="pmc-login-options"><label><input type="checkbox" name="rememberMe" disabled={busy}/>დამიმახსოვრე</label><a href="/admin/forgot">პაროლის აღდგენა</a></div>
  {error&&<p role="alert" className="pmc-login-error">{error}</p>}
  <button type="submit" className="pmc-login-submit" disabled={busy}>{busy?<><span className="pmc-spinner"/>მიმდინარეობს შესვლა…</>:'შესვლა'}</button>
 </form>;
}
