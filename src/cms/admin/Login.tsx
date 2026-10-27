import type {AdminViewServerProps} from 'payload';
import {redirect} from 'next/navigation';
import {LoginForm} from './LoginForm';
export function Login({initPageResult}:AdminViewServerProps){
 if(initPageResult.req.user?.active)redirect('/admin');
 return <section className="pmc-login-card"><div className="pmc-login-brand"><div className="pmc-brand"><img src="/images/company-logo.png" alt="აჭარის პროექტების მართვის კომპანია" width="70" height="75"/><div><strong>აჭარის პროექტების<br/>მართვის კომპანია</strong></div></div></div><LoginForm/></section>;
}
