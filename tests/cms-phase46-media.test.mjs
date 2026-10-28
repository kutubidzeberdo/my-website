import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {chromium} from 'playwright-core';
const base=process.env.CMS_TEST_URL||'http://localhost:3100';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const p=await browser.newPage({viewport:{width:1440,height:1100}});const cleanup=[];const errors=[];const key=randomBytes(4).toString('hex');
p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
const body=text=>({root:{type:'root',format:'',indent:0,version:1,direction:null,children:[{type:'paragraph',format:'',indent:0,version:1,direction:null,children:[{type:'text',text,format:0,version:1,detail:0,mode:'normal',style:''}]}]}});
const flatten=n=>[n,...(n.children||[]).flatMap(flatten)];const id=x=>x?.id||x;
async function api(path,method='GET',data){const r=await p.request.fetch(base+'/api/'+path,{method,headers:{Origin:base},...(data?{data}:{})});assert.ok(r.ok(),path+' '+r.status()+' '+(r.ok()?'':await r.text()));return r.json();}
async function open(collection,doc){await p.goto(base+'/admin/collections/'+collection+'/'+doc,{waitUntil:'networkidle'});await p.locator('.pmc-interface-language select').selectOption('ka');await p.getByRole('tab',{name:'ქართული',exact:true}).click();}
async function clickThumbnail(index=0){const drawer=p.locator('.list-drawer:visible').last();const row=drawer.locator('tbody tr').nth(index);const image=row.locator('img').first();await image.waitFor();const src=await image.getAttribute('src');await image.click();await drawer.waitFor({state:'hidden'});return src;}
async function select(field,index=0){const scope=p.locator('[id="field-'+field+'"]');await scope.getByRole('button',{name:'არსებულის არჩევა',exact:true}).click();const src=await clickThumbnail(index);await scope.locator('img').first().waitFor();assert.ok(await scope.locator('img').first().getAttribute('src'));return src;}
async function save(collection,drafts=true){const done=p.waitForResponse(r=>r.url().includes('/api/'+collection+'/')&&r.request().method()==='PATCH');await p.locator(drafts?'#pmc-publish':'#pmc-save').click();const r=await done;assert.equal(r.status(),200,await r.text());await p.waitForTimeout(300);}
try{
 await p.goto(base+'/admin/login');const c=JSON.parse(await readFile('.cms-backups/initial-admin.json','utf8'));await p.locator('[name=username]').fill(c.username);await p.locator('[name=password]').fill(c.password);await p.locator('button[type=submit]').click();await p.waitForURL('**/admin');
 const media=(await api('media?limit=100&depth=0&sort=-createdAt')).docs;assert.ok(media.length>=2);const category=(await api('project-categories?limit=1')).docs[0].id;
 for(const collection of ['news','projects']){
  const ka='ქართული უცვლელი '+collection+' '+key;const en='English preserved '+key;
  const made=(await api(collection+'?locale=all','POST',{title:{ka,en},content:{ka:body(ka),en:body(en)},slug:'phase46-'+collection+'-'+key,_status:'draft',...(collection==='projects'?{status:'ongoing',progress:55,category}:{}),gallery:[]})).doc;cleanup.push([collection,made.id]);
  await open(collection,made.id);
  const selectedSrc=await select('image',0);const selected=media.find(m=>selectedSrc.includes(m.sizes.thumbnail.filename)||selectedSrc.includes(m.filename));assert.ok(selected,'identify actual clicked thumbnail');
  await select('seo__image',1);
  // Existing row upload paths prove the drawer assigns its own nested field.
  const g=p.locator('#field-gallery');
  for(let n=0;n<2;n++){
   await g.getByRole('button',{name:/ფოტო.*დამატება|დამატება: ფოტო/}).click();
   await select('gallery__'+n+'__image',n);
  }
  // Real Lexical toolbar insertion, preserving unsaved text in both languages.
  const editor=p.locator('[data-content-locale=ka] [contenteditable=true]').first();await editor.fill(ka+' ჩაუნახავი ტექსტი');await editor.click();await p.keyboard.press('Meta+End');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
  const toolbar=p.locator('[data-content-locale=ka] .fixed-toolbar').first();await toolbar.getByRole('button',{name:'add dropdown',exact:true}).click();await p.getByRole('button',{name:'ფოტოს ჩასმა',exact:true}).click();await clickThumbnail(0);await p.locator('[data-content-locale=ka] .rich-text-lexical img').first().waitFor();assert.ok((await editor.innerText()).includes('ჩაუნახავი ტექსტი'));
  await editor.click();await p.keyboard.press('Meta+End');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
  await toolbar.getByRole('button',{name:'blocks dropdown',exact:true}).click();await p.getByRole('button',{name:'ფოტოგალერეა',exact:true}).click();
  const block=p.locator('[data-content-locale=ka] .LexicalEditorTheme__block').filter({hasText:'ფოტოგალერეა'}).first();
  for(const index of [1,0]){await block.getByRole('button',{name:/ფოტო.*დამატება|დამატება: ფოტო/}).click();await block.getByRole('button',{name:'არსებულის არჩევა',exact:true}).last().click();await clickThumbnail(index);}
  await block.locator('.pmc-gallery-preview img').nth(1).waitFor();
  await save(collection);let stored=await api(collection+'/'+made.id+'?locale=all&depth=0');assert.equal(stored.image,selected.id);assert.equal(stored.seo.image,media[1].id);assert.deepEqual(stored.gallery.map(r=>id(r.image)),media.slice(0,2).map(m=>m.id));assert.equal(stored.title.en,en);assert.ok(JSON.stringify(stored.content.en).includes(en));const nodes=flatten(stored.content.ka.root);assert.ok(nodes.some(n=>n.type==='upload'&&id(n.value)===selected.id));assert.deepEqual(nodes.find(n=>n.fields?.blockType==='gallery').fields.gallery.map(r=>id(r.image)),[media[1].id,media[0].id]);assert.ok(JSON.stringify(stored.content.ka).includes('ჩაუნახავი ტექსტი'));
  await open(collection,made.id);await p.locator('#field-image img').waitFor();assert.ok(await p.locator('[data-content-locale=ka] .rich-text-lexical img').count());assert.equal(await p.locator('#field-gallery').last().locator('.array-field__row').count(),2);
  console.log('PASS thumbnail click/close/preview/save/reopen: featured, SEO override, two ordered gallery rows, Lexical image + unsaved KA/EN preserved',collection,JSON.stringify({featured:stored.image,seo:stored.seo.image,gallery:stored.gallery.map(r=>id(r.image))}));
  if(collection==='projects'){
   assert.ok(await p.locator('#field-progress').isVisible());assert.equal(await p.locator('.pmc-progress-preview progress').getAttribute('value'),'55');await p.locator('#field-progress').fill('101');await p.locator('#pmc-publish').click();await p.waitForTimeout(500);assert.ok(await p.locator('.field-error:visible').filter({hasText:/0.*100/}).count(),'actual progress validation error');assert.equal((await api(collection+'/'+made.id+'?depth=0')).progress,55);await p.locator('#field-progress').fill('55');
  }
  const publicPage=await browser.newPage();await publicPage.goto(base+'/'+collection+'/'+made.slug,{waitUntil:'networkidle'});assert.equal(await publicPage.locator('h1').innerText(),ka);assert.ok(await publicPage.locator('meta[property="og:image"]').count());const og=await publicPage.locator('meta[property="og:image"]').first().getAttribute('content');assert.ok(og.includes(media[1].filename),'SEO manual override');await publicPage.locator('.classic-gallery .gallery-tile').first().click();await publicPage.locator('dialog.gallery-lightbox[open]').waitFor();await publicPage.keyboard.press('ArrowRight');await publicPage.keyboard.press('Escape');assert.equal(await publicPage.locator('dialog.gallery-lightbox[open]').count(),0);if(collection==='projects')assert.match(await publicPage.locator('main').innerText(),/55\s*%/);await publicPage.close();
  await api(collection+'/'+made.id,'PATCH',{seo:{image:null}});const fallback=await browser.newPage();await fallback.goto(base+'/'+collection+'/'+made.slug,{waitUntil:'networkidle'});assert.ok((await fallback.locator('meta[property="og:image"]').first().getAttribute('content')).includes(selected.filename),'featured OG fallback');await fallback.close();console.log('PASS public render, gallery/lightbox, OG override and featured fallback',collection);
 }
 for(const collection of ['slides','testimonials']){
  const made=(await api(collection+'?locale=all','POST',{title:{ka:'მედიის ტესტი '+key,en:'Media test '+key},...(collection==='testimonials'?{quote:{ka:'სატესტო გამოხმაურება',en:'Test quote'}}:{}),active:false})).doc;cleanup.push([collection,made.id]);
  await p.setViewportSize({width:390,height:844});await open(collection,made.id);const field=collection==='slides'?'image':'portrait';await select(field,0);await save(collection,false);const stored=await api(collection+'/'+made.id+'?depth=0');assert.equal(stored[field],media[0].id);await open(collection,made.id);await p.locator('#field-'+field+' img').waitFor();console.log('PASS mobile thumbnail click/close/preview/save/reopen',collection,stored[field]);await p.setViewportSize({width:1440,height:1100});
 }
 // Global relationship fields are exercised without saving organization settings.
 for(const [global,fields] of [['about',['image','seo__image']],['site-settings',['logo','symbolLogo','fullLogo']]]){await p.goto(base+'/admin/globals/'+global,{waitUntil:'networkidle'});await p.getByRole('tab',{name:'ქართული',exact:true}).click();for(const field of fields){const scope=p.locator('[id="field-'+field+'"]');if(await scope.getByRole('button',{name:'არსებულის არჩევა',exact:true}).count()){await select(field);console.log('PASS unsaved global thumbnail selection',global,field);}else {await scope.locator('.upload-relationship-details__remove').click();await select(field);console.log('PASS unsaved existing global field replacement',global,field);}}}
 assert.deepEqual(errors,[]);
}catch(e){console.log('FAILED',p.url(),(await p.locator('body').innerText()).slice(-2000));await p.screenshot({path:'/tmp/phase46-media-failure.png',fullPage:true});throw e;}finally{for(const [collection,doc]of cleanup)await api(collection+'/'+doc,'DELETE');await browser.close();}
