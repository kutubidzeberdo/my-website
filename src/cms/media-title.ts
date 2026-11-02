export function dataTitle(value:unknown):boolean{return typeof value==='string'?!!value.trim():!!value&&typeof value==='object'&&['ka','en'].some(locale=>dataTitle((value as Record<string,unknown>)[locale]));}
export function mediaTitle(filename:string):string{return filename.replace(/^.*[\\/]/,'').replace(/\.[^.]+$/,'')||filename;}
