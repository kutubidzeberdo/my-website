// Isolated browser harness. No real service, credentials, cookies, or database access.
import {chromium} from 'playwright-core';
import {build} from 'esbuild';
import assert from 'node:assert/strict';
const {outputFiles}=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {GalleryField} from './src/cms/admin/BatchImages';window.rows=[{image:100}];createRoot(document.getElementById('root')).render(<GalleryField path="gallery" field={{name:'gallery',type:'array',fields:[]}}/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,jsx:'automatic',plugins:[{name:'isolated-admin-context',setup(b){b.onResolve({filter:/^(@payloadcms\/ui|next\/navigation)$/},args=>({path:args.path,namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:args.path==='next/navigation'?`export function useRouter(){return {refresh:()=>{}};}`:`export function useConfig(){return {config:{routes:{api:'/api'}}};}export function useTranslation(){return {i18n:{language:'en'}};}export function ArrayField(){return null;}export function useForm(){return {getDataByPath:()=>window.rows,addFieldRow:({rowIndex,subFieldState})=>window.rows.splice(rowIndex,0,{image:subFieldState.image.value})};}`}));}}]});
const script=outputFiles[0].text;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{const page=await browser.newPage();let next=201;const names=[];
 await page.route('https://pmc-test.invalid/**',async route=>{
 if(route.request().method()==='POST'){const data=route.request().postDataBuffer().toString();const filename=/filename="([^"]+)"/.exec(data)?.[1];names.push(filename);await route.fulfill({status:filename==='bad.png'?400:201,contentType:'application/json',body:JSON.stringify(filename==='bad.png'?{errors:[{message:'Invalid test image'}]}:{doc:{id:next++}})});}
 else await route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});
 await page.goto('https://pmc-test.invalid/');await page.addScriptTag({content:script});
 const files=['first.png','bad.png','last.png'].map(name=>({name,mimeType:'image/png',buffer:Buffer.from('isolated fixture')}));
 await page.locator('input[type=file]').setInputFiles(files);await page.getByRole('status').getByText('2 images uploaded').waitFor();assert.deepEqual(names,['first.png','bad.png','last.png']);assert.deepEqual(await page.evaluate(()=>window.rows),[{image:100},{image:201},{image:202}]);assert.match(await page.getByRole('status').innerText(),/bad.png: Invalid test image/);
 await page.locator('[aria-busy]').dispatchEvent('drop',{dataTransfer:await page.evaluateHandle(()=>{const d=new DataTransfer();d.items.add(new File(['a'],'drop-a.png',{type:'image/png'}));d.items.add(new File(['b'],'drop-b.png',{type:'image/png'}));return d;})});
 await page.waitForFunction(()=>window.rows.length===5);assert.deepEqual(names,['first.png','bad.png','last.png','drop-a.png','drop-b.png']);assert.deepEqual(await page.evaluate(()=>window.rows.map(row=>row.image)),[100,201,202,203,204]);console.log('PASS isolated Chrome multi-select, multi-drop, failure reporting, successful-file retention, existing rows and selection order (mocked endpoint and form context)');
}finally{await browser.close();}
