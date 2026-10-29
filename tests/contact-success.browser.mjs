// Real components and styles, isolated from CMS/database and external email services.
// Run: node tests/contact-success.browser.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {chromium} from 'playwright-core';

const bundle=await build({
  stdin:{contents:`import React,{useState} from 'react';
    import {createRoot} from 'react-dom/client';
    import ContactForm from './src/components/ContactForm';
    import {CMSProvider} from './src/components/CMSContext';
    import {PublicLanguage} from './src/components/PublicLanguage';
    import {content} from './src/data/content';
    function App(){const [language,setLanguage]=useState('ka');return <CMSProvider value={{settings:{copy:content.ka,companyName:content.ka.company,logo:'',email:'ajarapmcpr@gmail.com'}}}>
      <PublicLanguage.Provider value={language}><button onClick={()=>setLanguage('ka')}>KA</button><button onClick={()=>setLanguage('en')}>EN</button><main className="contact-page wrap"><ContactForm/></main></PublicLanguage.Provider>
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
  const exceptions=[];page.on('pageerror',error=>exceptions.push(error.message));
  const payloads=[],keys=[];
  let outcome='failure',release;
  await page.route('**/api/contact',async route=>{
    if(route.request().method()==='GET')return route.fulfill({json:{available:true}});
    payloads.push(route.request().postDataJSON());keys.push(route.request().headers()['idempotency-key']);
    await new Promise(resolve=>{release=resolve;});
    if(outcome==='failure')return route.fulfill({status:429,json:{error:'Gmail-ის გაგზავნის ლიმიტი დროებით ამოიწურა.'}});
    if(outcome==='empty')return route.fulfill({status:204});
    return route.fulfill({json:{message:'Gmail API-მ წერილი გასაგზავნად მიიღო. ეს არ ადასტურებს მის საბოლოო მიწოდებას.'}});
  });
  const base=`http://127.0.0.1:${server.address().port}`;
  const fields={name:'Test Visitor',email:'visitor@example.com',phone:'+995599123456',subject:'Feedback test',message:'A manually submitted test message.'};
  async function fill(){for(const [name,value] of Object.entries(fields))await page.locator(`[name=${name}]`).fill(value);await page.locator('.consent input').check();}
  async function submit(){release=undefined;await page.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('button[type=submit]').disabled);while(!release)await new Promise(resolve=>setTimeout(resolve,10));}
  async function cleared(){for(const name of [...Object.keys(fields),'website'])assert.equal(await page.locator(`[name=${name}]`).inputValue(),'');assert.equal(await page.locator('.consent input').isChecked(),false);assert.equal(await page.locator('[aria-invalid=true]').count(),0);assert.equal(await page.locator('.field-error').count(),0);assert.equal(await page.locator('button[type=submit]').isEnabled(),true);}
  for(const width of [1440,390])for(const language of ['ka','en']) {
    await page.setViewportSize({width,height:1000});await page.goto(base);await page.getByRole('button',{name:language.toUpperCase(),exact:true}).click();
    await page.locator('button[type=submit]:enabled').waitFor();
    const success=language==='ka'?'წარმატებით გაიგზავნა':'Successfully sent';
    // Trigger real validation first, then correct the inputs.
    await page.locator('button[type=submit]').click();assert.ok(await page.locator('.field-error').count());
    await fill();outcome='failure';const start=payloads.length;await submit();
    assert.equal(await page.getByText(success,{exact:true}).count(),0);
    // Multiple submit events while pending must not send multiple requests.
    await page.locator('form').evaluate(form=>{for(let i=0;i<3;i++)form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
    assert.equal(payloads.length,start+1);release();await page.getByRole('alert').waitFor();
    assert.equal(await page.getByRole('alert').innerText(),language==='ka'?'Gmail-ის გაგზავნის ლიმიტი დროებით ამოიწურა.':'The Gmail sending limit has temporarily been reached.');
    for(const [name,value] of Object.entries(fields))assert.equal(await page.locator(`[name=${name}]`).inputValue(),value);
    assert.equal(await page.locator('.consent input').isChecked(),true);
    // Only an explicit second submission is made; no automatic retry.
    assert.equal(payloads.length,start+1);outcome='success';await submit();assert.equal(await page.getByText(success,{exact:true}).count(),0);
    release();await page.getByText(success,{exact:true}).waitFor();await cleared();
    assert.equal(await page.getByText(success,{exact:true}).evaluate(el=>getComputedStyle(el).color),'rgb(22, 115, 59)');
    assert.equal(await page.locator('.contact-form').innerText().then(text=>text.includes('Gmail API')),false);
    assert.equal(payloads.length,start+2);
    // A new, deliberate submission gets a new key. Any 2xx, including empty 204, succeeds.
    await fill();assert.equal(await page.getByText(success,{exact:true}).count(),0);outcome='empty';await submit();release();
    await page.getByText(success,{exact:true}).waitFor();await cleared();
    assert.notEqual(keys[start+2],keys[start+1]);assert.equal(payloads.length,start+3);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  assert.deepEqual(exceptions,[]);
  console.log('PASS KA/EN desktop/mobile: confirmed 2xx and 204 show exact green success, clear all fields/errors/consent, and reset for a new submission.');
  console.log('PASS failures preserve fields and error text; pending submissions hide success and prevent duplicate sends; no automatic retries.');
} finally {
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
