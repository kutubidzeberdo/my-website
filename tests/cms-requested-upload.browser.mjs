// Isolated gallery-extension test: real native Dropzone, mocked admin context and upload responses.
// This does not authenticate against Payload or test DigitalOcean Spaces.
import {chromium} from 'playwright-core';
import {build} from 'esbuild';
import path from 'node:path';
import assert from 'node:assert/strict';
const uiMock=`
 import React,{createContext,useCallback,useRef,useMemo,useSyncExternalStore} from 'react';
 import {Dropzone} from 'native-dropzone';
 const context=createContext(null);const listeners=new Set();window.rows=[{image:100},{image:null}];
 const notify=()=>listeners.forEach(fn=>fn());
 const form={getDataByPath:p=>p==='gallery'?window.rows:window.rows[Number(p.split('.')[1])]?.image,
 dispatchFields:({path,value})=>{window.rows[Number(path.split('.')[1])].image=value;notify();},setModified:()=>{},
 addFieldRow:({rowIndex,subFieldState})=>{window.rows.splice(rowIndex,0,{image:subFieldState.image.value});notify();}};
 export function useForm(){return form;}
 export function useFieldPath(){return undefined;}
 export function useField({path}){const value=useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn);},()=>form.getDataByPath(path));const setValue=useCallback(value=>form.dispatchFields({path,value}),[path]);return {value,setValue};}
 export function useConfig(){return {config:{routes:{api:'/api'}}};}
 export function ArrayField(){return null;}
 export function BulkUploadProvider({children}){const current=useRef(()=>{});const setOnSuccess=useCallback(fn=>{current.current=fn;},[]);const value=useMemo(()=>({current,setOnSuccess}),[setOnSuccess]);return <context.Provider value={value}>{children}</context.Provider>;}
 export function useBulkUpload(){return React.useContext(context);}
 export function UploadInput({hasMany,value,onChange}){
 const input=useRef(null);const bulk=useBulkUpload();const [messages,setMessages]=React.useState([]);
 async function upload(files){const docs=[];const errors=[];for(const file of Array.from(files)){const body=new FormData();body.append('file',file);const response=await fetch('/api/media',{method:'POST',body});const json=await response.json();if(response.ok)docs.push({doc:json.doc});else errors.push(file.name+': '+json.errors[0].message);}bulk.current.current(docs);setMessages([docs.length+' images uploaded',...errors]);}
 return <><Dropzone multipleFiles={hasMany} onChange={upload}><button type="button" onClick={()=>input.current.click()}>Create new</button><input ref={input} type="file" hidden multiple={hasMany} onChange={e=>upload(e.target.files)}/></Dropzone><div role="status">{messages.map((m,i)=><p key={i}>{m}</p>)}</div></>;
 }
`;
const {outputFiles}=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {GalleryImage} from './src/cms/admin/BatchImages';const root=createRoot(document.getElementById('root'));window.show=(index)=>root.render(<GalleryImage key={index} path={'gallery.'+index+'.image'} field={{name:'image',type:'upload',relationTo:'media'}}/>);window.show(1);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,jsx:'automatic',loader:{'.scss':'empty'},plugins:[{name:'isolated-admin-context',setup(b){b.onResolve({filter:/^@payloadcms\/ui$/},()=>({path:'ui',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:uiMock,loader:'tsx',resolveDir:process.cwd()}));b.onResolve({filter:/^native-dropzone$/},()=>({path:path.resolve('node_modules/@payloadcms/ui/dist/elements/Dropzone/index.js')}));}}]});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{const page=await browser.newPage();let next=201;const names=[];
 await page.route('https://pmc-test.invalid/**',async route=>{
 if(route.request().method()==='POST'){const filename=/filename="([^"]+)"/.exec(route.request().postDataBuffer().toString())?.[1];names.push(filename);await route.fulfill({status:filename==='bad.png'?400:201,contentType:'application/json',body:JSON.stringify(filename==='bad.png'?{errors:[{message:'Invalid test image'}]}:{doc:{id:next++}})});}
 else await route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});
 await page.goto('https://pmc-test.invalid/');await page.addScriptTag({content:outputFiles[0].text});
 await page.locator('input[type=file]').setInputFiles(['first.png','bad.png','last.png'].map(name=>({name,mimeType:'image/png',buffer:Buffer.from('fixture')})));
 await page.getByRole('status').getByText('2 images uploaded').waitFor();assert.deepEqual(names,['first.png','bad.png','last.png']);assert.deepEqual(await page.evaluate(()=>window.rows.map(r=>r.image)),[100,201,202]);assert.match(await page.getByRole('status').innerText(),/bad.png: Invalid test image/);
 // Batch attachment switches the filled relationship back to single-image behavior.
 assert.equal(await page.locator('input[type=file]').getAttribute('multiple'),null);
 await page.evaluate(()=>{window.rows.push({image:null});window.show(3);});
 await page.waitForFunction(()=>document.querySelector('input[type=file]')?.multiple===true);
 await page.locator('.dropzone').dispatchEvent('drop',{dataTransfer:await page.evaluateHandle(()=>{const d=new DataTransfer();for(const name of ['drop-a.png','drop-b.png'])d.items.add(new File(['a'],name,{type:'image/png'}));return d;})});
 await page.waitForFunction(()=>window.rows.length===5&&window.rows[3].image!==null);assert.deepEqual(await page.evaluate(()=>window.rows.map(row=>row.image)),[100,201,202,203,204]);assert.deepEqual(names,['first.png','bad.png','last.png','drop-a.png','drop-b.png']);
 assert.equal(await page.getByRole('button',{name:/Upload multiple|რამდენიმე/}).count(),0);
 console.log('PASS isolated native-Dropzone chooser/drop + gallery mapping, partial success and single relationships (mocked upload/form context)');
}finally{await browser.close();}
