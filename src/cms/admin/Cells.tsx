import type {DefaultCellComponentProps} from 'payload';
export function ProjectStatusCell({cellData}:DefaultCellComponentProps){const labels:Record<string,string>={ongoing:'მიმდინარე',completed:'დასრულებული',planned:'დაგეგმილი'};return <span className={`pmc-status pmc-status--${String(cellData)}`}>{labels[String(cellData)]||'—'}</span>;}
export function ActiveCell({cellData}:DefaultCellComponentProps){return <span className={`pmc-status ${cellData?'pmc-status--completed':'pmc-status--muted'}`}>{cellData?'აქტიური':'გამორთული'}</span>;}
export function ProgressCell({cellData}:DefaultCellComponentProps){return typeof cellData==='number'?<span className="pmc-progress-cell"><progress max={100} value={cellData} aria-label={`პროგრესი ${cellData}%`}/><span>{cellData}%</span></span>:<span className="pmc-cell-muted">უცნობია</span>;}

export function FileSizeCell({cellData}:DefaultCellComponentProps){const bytes=Number(cellData);return cellData==null||!Number.isFinite(bytes)?<span>—</span>:<span className="pmc-cell-muted">{bytes>=1048576?`${(bytes/1048576).toFixed(1)} MB`:`${Math.round(bytes/1024)} KB`}</span>;}
