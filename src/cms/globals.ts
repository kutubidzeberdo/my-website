import type { Field, GlobalConfig } from 'payload';
import { homepage } from '../data/homepage';
import { content } from '../data/content';
import { testimonials } from '../data/ui';
import {invalidatePublic} from './public-invalidation';
import { can } from './access';
import { auditGlobal, validateContent } from './hooks';
import { image, seo, text } from './fields';

const copyLabels: Record<string,string> = {
 sections:'მთავარი გვერდის სექციები',testimonialsCopy:'გამოხმაურებების სექციის ტექსტები',copy:'საიტის ტექსტები',value:'ტექსტი / მნიშვნელობა',
 processLabel:'სამუშაო პროცესის წარწერა',processTitle:'სამუშაო პროცესის სათაური',processIntro:'სამუშაო პროცესის შესავალი',stages:'სამუშაო ეტაპები',
 servicesLabel:'საქმიანობის წარწერა',servicesTitle:'საქმიანობის სათაური',categories:'კატეგორიების დასახელებები',serviceDescriptions:'მიმართულებების აღწერები',
 portfolioLabel:'პორტფელის წარწერა',portfolioTitle:'პორტფელის სათაური',demo:'საილუსტრაციო გაფრთხილება',all:'ყველა ელემენტის ბმული',preview:'მიმოხილვის ბმული',close:'დახურვის ტექსტი',
 transparencyLabel:'გამჭვირვალობის წარწერა',transparencyTitle:'გამჭვირვალობის სათაური',transparencyText:'გამჭვირვალობის ტექსტი',transparencyPanel:'პანელის სათაური',transparencyItems:'გამჭვირვალობის პუნქტები',transparencyNote:'გამჭვირვალობის შენიშვნა',
 metrics:'სტატისტიკის საწყისი ტექსტები',progressLabel:'მშენებლობის წარწერა',progressTitle:'მიმდინარე პროექტების სათაური',phase:'მიმდინარე ეტაპის წარწერა',updated:'განახლების წარწერა',newsLabel:'მედია ცენტრის წარწერა',newsTitle:'სიახლეების სათაური',read:'სტატიის ბმულის ტექსტი',sample:'საილუსტრაციო სიახლის წარწერა',
 title:'სათაური',intro:'შესავალი',label:'წარწერა',placeholder:'საილუსტრაციო წარწერა',quotes:'გამოხმაურებების საწყისი ტექსტები',note:'შენიშვნა',previous:'წინა ელემენტის ტექსტი',next:'შემდეგი ელემენტის ტექსტი',
 company:'კომპანიის დასახელება',short:'ლოგოს ტექსტის პირველი ხაზი',second:'ლოგოს ტექსტის მეორე ხაზი',nav:'ნავიგაციის წარწერები',contact:'საკონტაქტო ღილაკი',explore:'პროექტების ღილაკი',eyebrow:'მთავარი წარწერა',slides:'სლაიდერის საწყისი ტექსტები',overview:'მიმოხილვის სათაური',description:'აღწერა',footerText:'ქვედა ნაწილის ტექსტი',footerTitles:'ქვედა ნაწილის სათაურები',footerLinks:'ქვედა ნაწილის ბმულები',contactNote:'მისამართის წარწერა',rights:'საავტორო უფლებების ტექსტი',pause:'შეჩერების ღილაკი',play:'გაშვების ღილაკი',menu:'მენიუს ღილაკი',
};
// Structured fields preserve existing copy without an opaque editable JSON blob.
export function copyField(name: string, value: unknown): Field {
 if(value && typeof value==='object'&&!Array.isArray(value)&&'ka' in value)return {name,type:'textarea',localized:true,label:copyLabels[name]||'ტექსტი'};
 if(Array.isArray(value))return {name,type:'array',label:copyLabels[name]||'ტექსტი',fields:[copyField('value',value[0]??'')]};
 if(value && typeof value==='object')return {name,type:'group',label:copyLabels[name]||'ტექსტი',fields:Object.entries(value).map(([k,v])=>copyField(k,v))};
 return typeof value==='number'?{name,type:'number',label:copyLabels[name]||'ტექსტი'}:{name,type:'textarea',localized:true,label:copyLabels[name]||'ტექსტი'};
}
const global=(slug:'about'|'site-settings'|'homepage',label:string,fields:Field[]):GlobalConfig=>({slug,label,admin:{group:'გვერდები და პარამეტრები'},access:{read:()=>true,update:can(slug,'update')},versions:{max:20},hooks:{beforeChange:[({data})=>{validateContent(data);return data;}],afterChange:[auditGlobal,invalidatePublic]},fields:[{name:'migrationSource',type:'text',admin:{readOnly:true,hidden:true},access:{update:()=>false}},...fields]});
export const About=global('about','კომპანიის შესახებ',[
 {type:'tabs',tabs:[
  {label:'შინაარსი',fields:[text('title','სათაური',true),{name:'content',type:'richText',label:'კომპანიის სრული აღწერა',localized:true,admin:{description:'მონიშნეთ ტექსტი ფორმატირებისთვის. ფოტო, ვიდეო და გალერეა დაამატეთ ინსტრუმენტების პანელიდან ან / მენიუდან.'}}]},
  {label:'მედია',fields:[image()]},{label:'SEO',fields:[seo]},
 ]},
 {name:'paragraphs',type:'array',label:'ოფიციალური ტექსტი (არქივი)',admin:{hidden:true},access:{update:()=>false},fields:[{name:'text',type:'textarea',localized:true,required:true,label:'აბზაცი'}]},
]);
export const SiteSettings=global('site-settings','საიტის პარამეტრები',[text('companyName','კომპანიის დასახელება',true),text('phone','ტელეფონი',false,false),text('telephoneHref','სატელეფონო ბმული',false,false),text('email','საჯარო ელფოსტა',false,false),text('address','მისამართი'),text('facebook','Facebook',false,false),text('instagram','Instagram',false,false),{...image('logo','ლოგო'),access:{update:({req})=>req.user?.active===true&&['super-admin','administrator'].includes(req.user.role)}},image('symbolLogo','ლოგოს სიმბოლო'),image('fullLogo','სრული ლოგო'),copyField('copy',content.ka)]);
export const Homepage=global('homepage','მთავარი გვერდის ტექსტები',[copyField('sections',homepage),copyField('testimonialsCopy',testimonials.ka),{name:'previewNotice',type:'textarea',localized:true,label:'საილუსტრაციო გაფრთხილება'}]);

// Public destination fields become live links after cutover; validate before persistence.
for(const field of SiteSettings.fields){if(!('name' in field))continue;if(['facebook','instagram'].includes(field.name)&&field.type==='text')field.validate=(value:unknown)=>{if(value===undefined||value===null||value==='')return true;try{const url=new URL(String(value));return typeof value==='string'&&url.protocol==='https:'&&!!url.hostname||'მიუთითეთ სრული HTTPS ბმული';}catch{return 'მიუთითეთ სრული HTTPS ბმული';}};if(field.name==='telephoneHref'&&field.type==='text')field.validate=(value:unknown)=>value===undefined||value===null||value===''||typeof value==='string'&&/^tel:[+0-9()\s-]+$/.test(value)||'გამოიყენეთ ტელეფონის ბმული: tel:+995…';}
