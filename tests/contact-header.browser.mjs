// Real components and styles, isolated from CMS/database and external email services.
// Run: node tests/contact-header.browser.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {chromium} from 'playwright-core';

const bundle=await build({
  stdin:{contents:`import React,{useState} from 'react';
    import {createRoot} from 'react-dom/client';
    import Header from './src/components/Header';
    import ContactForm from './src/components/ContactForm';
    import {CMSProvider} from './src/components/CMSContext';
    import {PublicLanguage} from './src/components/PublicLanguage';
    import {content} from './src/data/content';
    function App(){const [language,setLanguage]=useState('ka');return <CMSProvider value={{settings:{copy:content.ka,companyName:content.ka.company,logo:'',email:'ajarapmcpr@gmail.com'}}}>
      <PublicLanguage.Provider value={language}><div className="about-header"><Header language={language} onLanguageChange={setLanguage} internalPage/></div><main className="contact-page wrap"><ContactForm/></main></PublicLanguage.Provider>
    </CMSProvider>};createRoot(document.getElementById('root')).render(<App/>);`,resolveDir:process.cwd(),loader:'tsx'},
  bundle:true,write:false,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{name:'unused-next-image',setup(b){b.onResolve({filter:/^next\/image$/},()=>({path:'image',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export default function Image(){return null;}'}));}}],
});
const css=await readFile('src/app/globals.css','utf8');
const server=createServer((req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','application/javascript');return res.end(bundle.outputFiles[0].text);}
  if(req.url==='/fixture.css'){res.setHeader('Content-Type','text/css');return res.end(css);}
  res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/fixture.css"><div id="root"></div><script src="/fixture.js"></script>');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const payloads=[];
  await page.route('**/api/contact',route=>{
    if(route.request().method()==='GET')return route.fulfill({json:{available:true}});
    const body=route.request().postDataJSON();payloads.push(body);
    return route.fulfill(body.website?{status:400,json:{error:'მოთხოვნა ვერ დამუშავდა.'}}:{json:{message:'Accepted'}});
  });
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const width of [1440,1280,1024,768,390,320]) {
    for(const language of ['ka','en']) {
      await page.setViewportSize({width,height:1000});await page.goto(base);
      await page.locator(`.languages button[lang=${language}]`).click();
      const label=language==='ka'?'კონტაქტი':'Contact';
      await page.getByRole('link',{name:label,exact:true}).waitFor();
      assert.equal(await page.locator('header a[href="/contact"]').count(),1);
      assert.equal(await page.locator('nav a[href="/contact"]').count(),0);
      assert.equal(await page.locator('.contact-button').getAttribute('href'),'/contact');
      const expectedLinks=['/#home','/about','/projects','/projects/ongoing','/projects/completed','/news'];
      assert.deepEqual(await page.locator('nav a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),expectedLinks);
      // Reconstruct the previous labels/menu item in the DOM to compare layout and styles.
      const geometry=await page.evaluate(language=>{
        const button=document.querySelector('.contact-button');
        const measure=()=>{const r=button.getBoundingClientRect(),s=getComputedStyle(button);return {x:r.x,y:r.y,width:r.width,height:r.height,background:s.backgroundColor,padding:s.padding,font:s.font,borderRadius:s.borderRadius};};
        const current=measure(),html=button.innerHTML;
        button.textContent=button.querySelector('[aria-hidden=true]').textContent;
        const link=document.createElement('a');link.href='/contact';link.textContent=language==='ka'?'კონტაქტი':'Contact';document.querySelector('nav').append(link);
        const previous=measure();link.remove();button.innerHTML=html;
        return {current,previous,overflow:document.documentElement.scrollWidth>innerWidth+1};
      },language);
      for(const key of ['x','y','width','height'])assert.ok(Math.abs(geometry.current[key]-geometry.previous[key])<1,`${language} ${width} button ${key}`);
      for(const key of ['background','padding','font','borderRadius'])assert.equal(geometry.current[key],geometry.previous[key]);
      assert.equal(geometry.overflow,false);
      if(width<=1250) {
        await page.locator('.menu-toggle').click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
        assert.equal(await page.locator('nav a[href="/about"]').isVisible(),true);
        await page.locator('.projects-toggle').click();
        assert.equal(await page.locator('nav a[href="/projects/ongoing"]').isVisible(),true);
      }
    }
  }
  console.log('PASS KA/EN navigation, language switching, mobile menu/submenu, unchanged button dimensions/styles/position at six widths');
  await page.goto(base);
  await page.locator('.contact-form button[type=submit]:enabled').waitFor();
  const trap=page.locator('[name=website]');
  assert.equal(await trap.inputValue(),'');
  assert.equal(await trap.getAttribute('tabindex'),'-1');
  assert.equal(await trap.evaluate(e=>e.getBoundingClientRect().right<0),true);
  for(const [name,value] of Object.entries({name:'Test Visitor',email:'visitor@example.com',phone:'+995599123456',subject:'Contact regression',message:'A legitimate test message.'}))await page.locator(`[name=${name}]`).fill(value);
  await page.locator('.consent input').check();
  await page.locator('.contact-form button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('.contact-form button[type=submit]')?.disabled);
  assert.equal(payloads.length,1);assert.equal(payloads[0].website,'');assert.equal(payloads[0].email,'visitor@example.com');
  // A bot can still change the trap; its value must reach the API and be rejected.
  await page.goto(base);await page.locator('.contact-form button[type=submit]:enabled').waitFor();
  for(const [name,value] of Object.entries({name:'Test Visitor',email:'visitor@example.com',subject:'Trap regression',message:'A test message with a populated trap.'}))await page.locator(`[name=${name}]`).fill(value);
  await page.locator('.consent input').check();
  await trap.evaluate(e=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'spam');e.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('.contact-form button[type=submit]').click();
  await page.getByRole('alert').waitFor();
  assert.equal(payloads.length,2);assert.equal(payloads[1].website,'spam');
  assert.equal(await page.getByRole('alert').innerText(),'მოთხოვნა ვერ დამუშავდა.');
  assert.deepEqual(errors,[]);
  console.log('PASS legitimate form payload keeps empty trap; scripted trap input is preserved and rejected (mock API; no email or database access)');
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
