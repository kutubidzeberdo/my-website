'use client';
import {useCallback,useEffect} from 'react';
import {ArrayField,BulkUploadProvider,UploadInput,useBulkUpload,useConfig,useField,useFieldPath,useForm} from '@payloadcms/ui';
import type {ArrayFieldClientProps,UploadFieldClientProps} from 'payload';
import {attachGalleryImages} from '../gallery-upload';

const emptyImages:never[]=[];

/** Keep the existing native drop area and each stored single-image relationship. */
function GalleryImageInput(props:UploadFieldClientProps){
 const {config}=useConfig();const {getDataByPath,addFieldRow,dispatchFields,setModified}=useForm();
 const {setOnSuccess}=useBulkUpload();const path=useFieldPath()||props.path;
 const validate=useCallback((value:any,options:any)=>props.validate?props.validate(value,{...options,required:props.field.required}):true,[props.validate,props.field.required]);
 const {value,showError,disabled,setValue}=useField<number|string|null>({path,validate});
 const attach=useCallback((ids:unknown)=>{
  const match=/^(.*)\.(\d+)\.image$/.exec(path);if(!match)return;
  attachGalleryImages({ids,path,galleryPath:match[1],schemaPath:props.schemaPath?.replace(/\.image$/,''),getDataByPath,
   setImage:id=>{dispatchFields({type:'UPDATE',path,value:id,valid:true});setModified(true);},addFieldRow});
 },[path,props.schemaPath,getDataByPath,dispatchFields,setModified,addFieldRow]);
 const uploaded=useCallback((forms:{doc:Record<string,unknown>}[])=>attach(forms.map(form=>form.doc.id)),[attach]);
 // The first success fills the row. Preserve the batch callback for retries of remaining files.
 useEffect(()=>{setOnSuccess(uploaded);},[setOnSuccess,uploaded,value]);
 const changed=useCallback((next:any)=>{if(Array.isArray(next))attach(next);else setValue(next);},[attach,setValue]);
 return <UploadInput path={path} relationTo="media" hasMany={!value} value={value||emptyImages} allowCreate={props.field.admin?.allowCreate!==false}
  api={config.routes.api} serverURL={config.serverURL} label={props.field.label} required={props.field.required}
  displayPreview={props.field.displayPreview} description={props.field.admin?.description}
  readOnly={props.readOnly||disabled} showError={showError} onChange={changed}/>;
}
export function GalleryImage(props:UploadFieldClientProps){
 return <BulkUploadProvider drawerSlugPrefix={props.path}><GalleryImageInput {...props}/></BulkUploadProvider>;
}
export function GalleryField(props:ArrayFieldClientProps){return <ArrayField {...props}/>;}
