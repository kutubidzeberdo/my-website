'use client';
import type {DefaultCellComponentProps} from 'payload';
export function MediaPreview({rowData}:DefaultCellComponentProps){const image=rowData.sizes?.thumbnail?.url||rowData.url;return image?<img src={image} width={90} height={64} style={{objectFit:'cover',borderRadius:8}} alt={rowData.alt||rowData.filename||''}/>:<span>—</span>;}
