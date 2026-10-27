const hosts=new Set(['www.youtube.com','youtube.com','youtu.be','vimeo.com','www.vimeo.com','player.vimeo.com']);
export function allowedVideoURL(value:unknown):boolean{if(value===undefined||value===null||value==='')return true;if(typeof value!=='string')return false;try{const u=new URL(value);return u.protocol==='https:'&&hosts.has(u.hostname);}catch{return false;}}
