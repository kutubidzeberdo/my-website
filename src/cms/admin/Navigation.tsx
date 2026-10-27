import type {PayloadRequest,VisibleEntities} from 'payload';
import {permitted,type Section} from '../access';
import {NavigationClient,type NavItem} from './NavigationClient';
const definitions:[string,string,string,string,Section?][]=[
 ['შინაარსი','news','სიახლეები','news','news'],['პროექტების მართვა','projects','ყველა პროექტი','projects','projects'],['პროექტების მართვა','ongoing','მიმდინარე პროექტები','ongoing','projects'],['პროექტების მართვა','completed','დასრულებული პროექტები','projects','projects'],['პროექტების მართვა','project-categories','პროექტების კატეგორიები','categories','project-categories'],['შინაარსი','media','მედია ბიბლიოთეკა','media','media'],
 ['მთავარი გვერდი','slides','მთავარი სლაიდერი','slides','slides'],['მთავარი გვერდი','testimonials','გამოხმაურებები','testimonials','testimonials'],['მთავარი გვერდი','statistics','სტატისტიკა','statistics','statistics'],['მთავარი გვერდი','homepage','მთავარი გვერდის ტექსტები','dashboard','homepage'],
 ['კომპანია','about','კომპანიის შესახებ','about','about'],['კომპანია','site-settings','საიტის პარამეტრები','settings','site-settings'],
 ['ადმინისტრირება','users','მომხმარებლები','users','users'],['ადმინისტრირება','audit-logs','აქტივობის ჟურნალი','audit'],
];
export function Navigation({req,visibleEntities}:{req:PayloadRequest;visibleEntities:VisibleEntities}){
 const items:NavItem[]=[];
 for(const [group,key,label,icon,section] of definitions){
  if(section&&!permitted(req.user,section,'read'))continue;
  if(key==='audit-logs'&&!(req.user?.active&&['super-admin','administrator'].includes(req.user.role)))continue;
  const global=['homepage','about','site-settings'].includes(key);
  if(!['ongoing','completed'].includes(key)&&!((global?visibleEntities.globals:visibleEntities.collections) as readonly string[]).includes(key))continue;
  const href=['ongoing','completed'].includes(key)?`/admin/collections/projects?where[status][equals]=${key}`:`/admin/${global?'globals':'collections'}/${key}`;
  items.push({group,key,label,icon,href});
 }
 return <NavigationClient items={items}/>;
}
