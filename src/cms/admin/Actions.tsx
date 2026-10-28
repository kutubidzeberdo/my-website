'use client';
import {FormSubmit,useUploadEdits,useConfig,useDocumentInfo,useForm,useFormModified,useTranslation} from '@payloadcms/ui';
/** One native form submission sends every locale in the same database transaction. */
function DocumentAction({kind}:{kind:'publish'|'unpublish'|'draft'|'save'}){
 const {uploadEdits}=useUploadEdits();const doc=useDocumentInfo();const {submit}=useForm();const {config}=useConfig();const {i18n}=useTranslation();const modified=useFormModified();
 if((kind==='publish'||kind==='unpublish')&&!doc.hasPublishPermission)return null;
 const labels={publish:{ka:'გამოქვეყნება',en:'Publish'},unpublish:{ka:'გამოქვეყნების გაუქმება',en:'Unpublish'},draft:{ka:'მონახაზის შენახვა',en:'Save Draft'},save:{ka:'შენახვა',en:'Save'}};
 const action=async()=>{
  const path=doc.globalSlug?`/globals/${doc.globalSlug}`:`/${doc.collectionSlug}${doc.id?'/'+doc.id:''}`;
  const query=new URLSearchParams({locale:'all','fallback-locale':'none',depth:'0',bilingual:'true'});
  // Keep native Media focal edits when constructing the bilingual save URL.
  // Forward only focal coordinates; this save never requests cropping the main file.
  if(doc.collectionSlug==='media'&&uploadEdits?.focalPoint){
   query.set('uploadEdits[focalPoint][x]',String(uploadEdits.focalPoint.x));
   query.set('uploadEdits[focalPoint][y]',String(uploadEdits.focalPoint.y));
  }
  if(kind==='draft')query.set('draft','true');
  if(kind==='publish')query.set('publishAllLocales','true');
  if(kind==='unpublish')query.set('unpublishAllLocales','true');
  const result=await submit({action:config.routes.api+path+'?'+query,method:doc.globalSlug||!doc.id?'POST':'PATCH',...(kind==='save'?{}:{overrides:{_status:kind==='publish'?'published':'draft'}}),skipValidation:kind==='draft'});
  if(result&&(kind==='publish'||kind==='unpublish')){doc.setHasPublishedDoc(kind==='publish');doc.setUnpublishedVersionCount(0);doc.setMostRecentVersionIsAutosaved(false);}
 };
 return <span className={kind==='publish'?'pmc-publish-action':kind==='unpublish'?'pmc-unpublish-action':''}><FormSubmit type="button" buttonId={'pmc-'+kind} disabled={doc.uploadStatus==='uploading'||(kind==='publish'?(!modified&&!doc.unpublishedVersionCount&&doc.hasPublishedDoc):kind!=='unpublish'&&!modified&&!!doc.id)} onClick={action}>{labels[kind][i18n.language==='en'?'en':'ka']}</FormSubmit></span>;
}
export const PublishAction=()=> <DocumentAction kind="publish"/>;
export const UnpublishAction=()=> <DocumentAction kind="unpublish"/>;
export const SaveDraftAction=()=> <DocumentAction kind="draft"/>;
export const SaveAction=()=> <DocumentAction kind="save"/>;
