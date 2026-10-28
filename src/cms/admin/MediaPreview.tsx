'use client';
import {useListDrawerContext, useSelection} from '@payloadcms/ui';
import type {DefaultCellComponentProps} from 'payload';

export function MediaPreview({rowData, collectionSlug}: DefaultCellComponentProps) {
 const {isInDrawer, onSelect, onBulkSelect} = useListDrawerContext();
 const {selected, setSelection} = useSelection();
 const image = rowData.sizes?.thumbnail?.url || rowData.url;
 const preview = image ? <img src={image} width={90} height={64} style={{objectFit:'cover',borderRadius:8}} alt={rowData.alt || rowData.filename || ''}/> : <span>—</span>;
 if (!isInDrawer || (!onSelect && !onBulkSelect)) return preview;
 const bulk = !onSelect && !!onBulkSelect;
 const chosen = selected.get(rowData.id) === true;
 return <button type="button" aria-label={rowData.filename || String(rowData.id)} aria-pressed={bulk ? chosen : undefined}
  style={{display:'inline-flex',padding:0,border:0,background:'transparent',cursor:'pointer',outline:bulk && chosen ? '2px solid currentColor' : undefined,borderRadius:8}}
  onClick={() => {
   // Use the native callback: it assigns the correct upload path or restores
   // the Lexical cursor, then closes the drawer through its existing owner.
   if (onSelect) onSelect({collectionSlug, doc:rowData, docID:rowData.id});
   else if (onBulkSelect) setSelection(rowData.id);
  }}>{preview}</button>;
}
