type ID=number|string;
const idOf=(value:any):ID|undefined=>typeof value==='number'||typeof value==='string'?value:value?.value??value?.id;
/** Add each successful native upload once, preserving all existing rows and order. */
export function attachGalleryImages({ids,path,galleryPath,schemaPath,getDataByPath,setImage,addFieldRow}:{
 ids:unknown;path:string;galleryPath:string;schemaPath?:string;
 getDataByPath:(path:string)=>any;setImage:(id:ID)=>void;
 addFieldRow:(args:{path:string;schemaPath:string;rowIndex:number;subFieldState:any})=>void;
}){
 const rows=getDataByPath(galleryPath)||[];const attached=new Set(rows.map((row:any)=>idOf(row.image)).filter((id:any)=>id!==undefined).map(String));
 let filled=idOf(getDataByPath(path))!==undefined;let index=rows.length;
 for(const value of Array.isArray(ids)?ids:[ids]){
  const id=idOf(value);if(id===undefined||attached.has(String(id)))continue;attached.add(String(id));
  if(!filled){setImage(id);filled=true;}else addFieldRow({path:galleryPath,schemaPath:schemaPath||galleryPath,rowIndex:index++,subFieldState:{image:{value:id,initialValue:id,valid:true}}});
 }
}
