import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { APIError, type CollectionBeforeChangeHook, type CollectionAfterChangeHook, type CollectionAfterDeleteHook, type GlobalAfterChangeHook } from 'payload';
import {allowedVideoURL} from './video';
import { permitted, type Section } from './access';

export const publishGuard = (section: Section): CollectionBeforeChangeHook => ({data, originalDoc, req}) => {
  if (req.context.cmsImport) return data;
  if ((data._status === 'published' || originalDoc?._status === 'published') && !permitted(req.user,section,'publish')) {
    throw new APIError('თქვენ არ გაქვთ გამოქვეყნების უფლება',403);
  }
  if (section === 'news' || section === 'projects') {
    if (req.user?.role === 'author' || !data.author) data.author = originalDoc?.author || req.user?.id;
  }
  return data;
};
export function validateContent(data:unknown) {
  function inspect(value: unknown) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(inspect); return; }
    const obj = value as Record<string,unknown>;
    if ('videoURL' in obj && !allowedVideoURL(obj.videoURL))throw new APIError('გამოიყენეთ YouTube ან Vimeo HTTPS ბმული',400);
    if (obj.type === 'html' || obj.type === 'script') throw new APIError('დაუშვებელი შინაარსი',400);
    if (typeof obj.url === 'string' && !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(obj.url)) throw new APIError('ბმულის ფორმატი დაუშვებელია',400);
    Object.values(obj).forEach(inspect);
  }
  inspect(data);
}
export const safeContent:CollectionBeforeChangeHook=({data})=>{validateContent(data);return data;};
async function log(req: Parameters<CollectionAfterChangeHook>[0]['req'], collection: string, recordID: string, action: string) {
  if (req.context.auditWrite || req.context.cmsImport) return;
  const id=await req.transactionID;
  const tx=id && (req.payload.db as unknown as PostgresAdapter).sessions[String(id)]?.db;
  try {
    if(tx)await tx.execute(sql`SAVEPOINT cms_audit_log`);
    await req.payload.create({collection:'audit-logs', data:{actor:req.user?.id, action, collectionName:collection, recordID, outcome:'success'}, req, overrideAccess:true, context:{...req.context,auditWrite:true}});
    if(tx)await tx.execute(sql`RELEASE SAVEPOINT cms_audit_log`);
  } catch {
    if(tx)await tx.execute(sql`ROLLBACK TO SAVEPOINT cms_audit_log`);
    req.payload.logger.warn('CMS audit log could not be written.');
  }
}
export const auditChange: CollectionAfterChangeHook = async ({doc,previousDoc,operation,collection,req}) => {
  let action: string = previousDoc?._status !== doc._status && doc._status ? doc._status : operation;
  if(collection.slug==='users' && previousDoc){
    const changes=[];
    if(previousDoc.role!==doc.role)changes.push('role-change');
    if(JSON.stringify(previousDoc.permissions)!==JSON.stringify(doc.permissions))changes.push('permissions-change');
    if(previousDoc.active!==doc.active)changes.push(doc.active?'activate':'deactivate');
    if(changes.length)action=changes.join(',');
  }
  await log(req,collection.slug,String(doc.id),action); return doc;
};
export const auditDelete: CollectionAfterDeleteHook = async ({doc,collection,req}) => {await log(req,collection.slug,String(doc.id),'delete'); return doc;};
export const auditGlobal: GlobalAfterChangeHook = async ({doc,global,req}) => {await log(req,global.slug,global.slug,'update'); return doc;};
