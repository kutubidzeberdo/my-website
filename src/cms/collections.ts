import path from 'node:path';
import {cardSize} from './image-sizes';
import {publicAssetRead} from './public-assets';
import {prepareSlug,retainSlug} from './slug';
import {protectSharedMedia} from './media-usage';
import {invalidatePublic} from './public-invalidation';
import sharp from 'sharp';
import { APIError, type CollectionConfig, type Field } from 'payload';
import { can, contentRead, owned, permitted, type Section } from './access';
import { auditChange, auditDelete, publishGuard, safeContent } from './hooks';
import { active, gallery, image, order, rich, seo, slug, sourceKey, text, video } from './fields';

function editorialTabs(fields:Field[]):Field[]{
 const content=new Set(['title','slug','summary','content']),media=new Set(['image','gallery','videoURL']),publishing=new Set(['publishedAt','seo','illustrative']);
 const named=(f:Field)=>'name' in f?f.name:'';
 const progressNames=new Set(['status','progress','progressVerified','progressPreview']);
 const progressFields=fields.filter(f=>progressNames.has(named(f)));
 const details=fields.filter(f=>!content.has(named(f))&&!media.has(named(f))&&!publishing.has(named(f))&&named(f)!=='author'&&!progressNames.has(named(f)));
 return [...(progressFields.length?[{type:'collapsible' as const,label:'პროექტის სტატუსი და შესრულების პროგრესი',admin:{initCollapsed:false},fields:progressFields}]:[]),{type:'tabs',tabs:[{label:'შინაარსი',fields:fields.filter(f=>content.has(named(f)))},{label:'მედია',fields:fields.filter(f=>media.has(named(f)))},...(details.length?[{label:'პროექტის მონაცემები',fields:details}]:[]),{label:'გამოქვეყნება და SEO',fields:fields.filter(f=>publishing.has(named(f)))}]},...fields.filter(f=>named(f)==='author')];
}
function managed(section: Section, singular: string, plural: string, fields: Field[], drafts=false): CollectionConfig {
 return {slug:section,labels:{singular,plural},admin:{group:'შინაარსი',useAsTitle:fields.some(f=>'name' in f&&f.name==='title')?'title':undefined,defaultColumns:['title','updatedAt',...(drafts?['_status']:[])]},
 access:{read:drafts?contentRead(section):can(section,'read'),create:can(section,'create'),update:owned(section,'update'),delete:owned(section,'delete')},
 ...(drafts?{versions:{drafts:true,maxPerDoc:30}}:{}),
 hooks:{...(drafts?{beforeValidate:[prepareSlug]}:{}),beforeChange:[safeContent,...(drafts?[retainSlug,publishGuard(section)]:[])],afterChange:[auditChange,invalidatePublic],afterDelete:[auditDelete,invalidatePublic]},
 fields:[sourceKey,...(drafts?[{name:'previousSlugs',type:'json' as const,admin:{hidden:true},access:{create:()=>false,update:()=>false}}]:[]),...(drafts?editorialTabs(fields):fields)]};
}
const author: Field = {name:'author',type:'relationship',relationTo:'users',label:'ავტორი',admin:{position:'sidebar'},access:{update:({req})=>req.user?.role!=='author'}};
const summary: Field = {name:'summary',type:'textarea',label:'მოკლე აღწერა',localized:true,maxLength:4000};
const publishedAt: Field = {name:'publishedAt',type:'date',label:'გამოქვეყნების თარიღი',index:true};
const demonstration: Field = {name:'illustrative',type:'checkbox',label:'საილუსტრაციო ჩანაწერი',defaultValue:false};
export const News=managed('news','სიახლე','სიახლეები',[text('title','სათაური',true),slug,summary,rich,image(),publishedAt,author,gallery,video,seo,demonstration],true);
// One canonical collection serves all project lifecycle views.
export const Projects=managed('projects','პროექტი','პროექტები',[text('title','სათაური',true),slug,summary,rich,image(),gallery,video,author,{name:'category',type:'relationship',relationTo:'project-categories',label:'კატეგორია',index:true},{name:'status',type:'select',admin:{components:{Cell:'/src/cms/admin/Cells#ProjectStatusCell',Field:'/src/cms/admin/ProjectControls#ProjectStatus'}},enumName:'project_lifecycle',label:'პროექტის სტატუსი',required:true,index:true,defaultValue:'planned',options:[{label:'მიმდინარე',value:'ongoing'},{label:'დასრულებული',value:'completed'},{label:'დაგეგმილი',value:'planned'}]},text('location','მდებარეობა'),{name:'progress',type:'number',label:'შესრულების პროგრესი (%)',min:0,max:100,validate:(v:unknown)=>v===null||v===undefined||typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100||'შეიყვანეთ რიცხვი 0-დან 100-მდე',admin:{components:{Cell:'/src/cms/admin/Cells#ProgressCell'},description:'უცნობი პროგრესი დატოვეთ ცარიელი; 0 და 100 დასაშვებია'}},{name:'progressPreview',type:'ui',admin:{components:{Field:'/src/cms/admin/ProjectControls#ProgressPreview'}}},{name:'progressVerified',type:'checkbox',label:'პროგრესი გადამოწმებულია',defaultValue:false},text('phase','მშენებლობის ეტაპი'),{name:'progressUpdatedAt',type:'date',label:'პროგრესის განახლება'},text('budget','ბიუჯეტი'),text('contractor','კონტრაქტორი'),text('client','დამკვეთი'),text('investment','ინვესტიცია'),text('area','ფართობი'),{name:'startDate',type:'date',label:'დაწყების თარიღი'},{name:'endDate',type:'date',label:'დასრულების თარიღი'},seo,demonstration],true);

export const Categories=managed('project-categories','კატეგორია','პროექტების კატეგორიები',[text('title','დასახელება',true),order]);
export const Slides=managed('slides','სლაიდი','მთავარი სლაიდერი',[text('title','სათაური',true),text('subtitle','ქვესათაური'),{name:'description',type:'textarea',label:'აღწერა',localized:true},image(),text('buttonText','ღილაკის ტექსტი'),{name:'buttonURL',type:'text',label:'ღილაკის მისამართი',validate:(v:unknown)=>!v||typeof v==='string'&&/^(\/(?!\/)|https:\/\/)/.test(v)||'ბმული არასწორია'},order,active]);
export const Testimonials=managed('testimonials','გამოხმაურება','კლიენტების გამოხმაურებები',[text('title','სახელი',true),text('position','პოზიცია / ორგანიზაცია'),{name:'quote',type:'textarea',label:'გამოხმაურება',localized:true,validate:(v:unknown,{req}:any)=>req.locale==='en'||typeof v==='string'&&!!v.trim()||'სავალდებულო ველი',maxLength:10000},image('portrait','პორტრეტი'),text('notice','საილუსტრაციო შენიშვნა'),demonstration,order,active]);
export const Statistics=managed('statistics','მაჩვენებელი','სტატისტიკა',[text('title','დასახელება',true),{name:'value',type:'number',label:'რიცხვი',required:true},text('suffix','სუფიქსი'),order,active,demonstration]);
export const Media: CollectionConfig={...managed('media','ფოტო','მედია ბიბლიოთეკა',[text('title','დასახელება'),text('alt','ალტერნატიული ტექსტი',true),text('caption','წარწერა'),{name:'sourceHash',type:'text',unique:true,index:true,admin:{readOnly:true,hidden:true}}]),
 upload:{staticDir:path.resolve('media'),mimeTypes:['image/jpeg','image/png','image/webp','image/gif','image/avif'],imageSizes:[{name:'thumbnail',width:400,height:300,position:'centre'},cardSize],adminThumbnail:'thumbnail',filesRequiredOnCreate:true},
 hooks:{beforeDelete:[protectSharedMedia],beforeOperation:[async ({req,operation})=>{
  if(!['create','update'].includes(operation)||!req.file)return;
  if(!req.context.cmsImport&&!permitted(req.user,'media',operation as 'create'|'update'))throw new APIError('თქვენ არ გაქვთ ფოტოს ატვირთვის უფლება',403);
  if(req.file.size>10*1024*1024)throw new APIError('ფოტო არ უნდა აღემატებოდეს 10 MB-ს',400);
  try{const meta=await sharp(req.file.data,{limitInputPixels:40_000_000}).metadata();
   const formats:Record<string,string[]>= {'image/jpeg':['jpeg'],'image/png':['png'],'image/webp':['webp'],'image/gif':['gif'],'image/avif':['avif','heif']};
   if(!formats[req.file.mimetype]?.includes(meta.format||''))throw new Error();
   if(!meta.width||!meta.height||meta.width*meta.height>40_000_000)throw new Error();
  }catch{throw new APIError('ფოტოს ფორმატი ან შინაარსი არასწორია',400);}
  req.file.name=`${crypto.randomUUID()}.${req.file.mimetype==='image/jpeg'?'jpg':req.file.mimetype.split('/')[1]}`;
 }],beforeChange:[safeContent],afterChange:[auditChange,invalidatePublic],afterDelete:[auditDelete,invalidatePublic]}};
export const AuditLogs: CollectionConfig={slug:'audit-logs',labels:{singular:'მოქმედება',plural:'აქტივობის ჟურნალი'},admin:{group:'ადმინისტრირება',defaultColumns:['createdAt','actor','action','collectionName','recordID']},access:{read:({req})=>req.user?.active===true&&['super-admin','administrator'].includes(req.user.role),create:()=>false,update:()=>false,delete:()=>false},fields:[{name:'actor',type:'relationship',relationTo:'users'},text('action','მოქმედება',true,false),text('collectionName','სექცია',true,false),text('recordID','ჩანაწერი',true,false),{name:'outcome',type:'select',options:['success','failure'],required:true}]};

News.admin={...News.admin,defaultColumns:['title','_status','publishedAt','updatedAt']};
Projects.admin={...Projects.admin,defaultColumns:['title','status','progress','_status','updatedAt']};
Slides.admin={...Slides.admin,defaultColumns:['title','order','active','updatedAt']};
Statistics.admin={...Statistics.admin,defaultColumns:['title','value','order','active']};
Testimonials.admin={...Testimonials.admin,defaultColumns:['title','position','active','updatedAt']};
Media.admin={...Media.admin,listSearchableFields:['title','alt','caption','filename'],defaultColumns:['title','alt','filesize','updatedAt']};
Media.fields.push({name:'filesize',type:'number',label:'ზომა',admin:{readOnly:true,components:{Cell:'/src/cms/admin/Cells#FileSizeCell'}}});

for(const collection of [News,Projects])collection.admin={...collection.admin,components:{...collection.admin?.components,edit:{PublishButton:'/src/cms/admin/Actions#PublishAction',UnpublishButton:'/src/cms/admin/Actions#UnpublishAction'}}};
Projects.admin!.components={...Projects.admin!.components,views:{list:{Component:'/src/cms/admin/ProjectControls#ProjectList'}}};
Media.admin={...Media.admin,description:'აქ შეგიძლიათ ატვირთოთ, ნახოთ და მართოთ საიტის ფოტოები და სხვა მედია ფაილები. ატვირთული ფაილების გამოყენება შესაძლებელია სიახლეებში, პროექტებში, სლაიდერსა და ფოტოგალერეებში.',defaultColumns:['mediaPreview','title','filename','mimeType','filesize','width','height','updatedAt']};
Media.fields.push({name:'mediaPreview',type:'ui',label:'ფოტო',admin:{components:{Cell:'/src/cms/admin/MediaPreview#MediaPreview'}}});

for(const collection of [Slides,Testimonials,Statistics])collection.access!.read=({req})=>permitted(req.user,collection.slug as Section,'read')?true:{active:{equals:true}};
Categories.access!.read=()=>true;Media.access!.read=publicAssetRead;

News.admin!.components={...News.admin!.components,views:{list:{Component:'/src/cms/admin/ProjectControls#EditorialList'}}};
