import type { Access, FieldAccess, PayloadRequest, Where } from 'payload';

export const sections = ['news','projects','project-categories','slides','media','testimonials','statistics','about','site-settings','homepage','users'] as const;
export const actions = ['read','create','update','publish','delete'] as const;
export type Section = typeof sections[number];
export type Action = typeof actions[number];
export type CMSUser = { id: number | string; role?: string; active?: boolean; permissions?: {section: string; actions?: string[] | null}[] | null };
export const isSuper = (user: unknown) => !!user && (user as CMSUser).active === true && (user as CMSUser).role === 'super-admin';
export function permitted(user: unknown, section: Section, action: Action): boolean {
  const u = user as CMSUser | null;
  if (!u || u.active !== true) return false;
  if (isSuper(u)) return true;
  const explicit = u.permissions?.find(p => p.section === section);
  if (explicit) return explicit.actions?.includes(action) ?? false;
  if (section === 'users') return false;
  if (u.role === 'administrator') return true;
  if (u.role === 'editor') return !['site-settings'].includes(section);
  if (u.role === 'author') return !['site-settings','about','homepage'].includes(section) && ['read','create','update'].includes(action);
  return u.role === 'viewer' && action === 'read';
}
export const superField: FieldAccess = ({req}) => isSuper(req.user);
export const can = (section: Section, action: Action): Access => ({req}) => permitted(req.user, section, action);
export const contentRead = (section: Section): Access => ({req}) => {
 if (permitted(req.user,section,'read')) {
  if ((req.user as CMSUser)?.role === 'author') return {or:[{_status:{equals:'published'}},{author:{equals:req.user!.id}}]} as Where;
  return true;
 }
 return {_status:{equals:'published'}} as Where;
};
export const owned = (section: Section, action: Action): Access => ({req}) => {
  if (!permitted(req.user, section, action)) return false;
  if (['news','projects'].includes(section) && (req.user as CMSUser)?.role === 'author') return {author:{equals:req.user!.id}};
  return true;
};
export function requirePermission(req: PayloadRequest, section: Section, action: Action) {
  if (!permitted(req.user, section, action)) throw new Error('თქვენ არ გაქვთ ამ მოქმედების შესრულების უფლება');
}
