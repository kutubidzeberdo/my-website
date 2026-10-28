import type {CollectionConfig, Field, GlobalConfig} from 'payload';

// Keep legacy storage definitions so existing values, locales and revision rows
// remain readable without a destructive migration. No editor is generated.
export const retiredFields: Record<string, readonly string[]> = {
 news: ['illustrative'],
 projects: ['illustrative', 'progressVerified'],
 testimonials: ['illustrative', 'notice'],
 statistics: ['illustrative'],
 homepage: ['previewNotice', 'sections.demo', 'sections.sample', 'sections.transparencyNote', 'testimonialsCopy.placeholder', 'testimonialsCopy.note'],
 'site-settings': ['copy.demo'],
};
export function retireObsoleteFields(entity: CollectionConfig | GlobalConfig) {
 const retired = retiredFields[entity.slug] || [];
 function visit(fields: Field[], parent: string[] = []) {
  for (const field of fields) {
   const path = 'name' in field && field.name ? [...parent, field.name] : parent;
   if ('name' in field && retired.includes(path.join('.'))) {
    field.label = false;
    field.admin = {...field.admin, hidden: true, readOnly: true, description: undefined};
   }
   if ('fields' in field) visit(field.fields, path);
   if (field.type === 'tabs') for (const tab of field.tabs) visit(tab.fields, 'name' in tab && tab.name ? [...path, tab.name] : path);
  }
 }
 visit(entity.fields);
}
