import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const base=process.env.CMS_TEST_URL||'http://localhost:3100';const credentials=JSON.parse(await readFile('.cms-backups/initial-admin.json','utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
let id;
try{
 await page.goto(`${base}/admin/login`,{waitUntil:'networkidle'});await page.locator('input[name=username]').fill(credentials.username);await page.locator('input[name=password]').fill(credentials.password);await page.locator('button[type=submit]').click();await page.waitForURL('**/admin');
 await page.goto(`${base}/admin/collections/slides/create`,{waitUntil:'networkidle'});
 await page.locator('#field-title').fill('CMS browser verification');
 await page.getByRole('button',{name:'შენახვა',exact:true}).click();await page.waitForURL(/\/slides\/\d+/);id=page.url().match(/\/slides\/(\d+)/)[1];
 await page.locator('.toast-success').waitFor();assert.equal(await page.locator('.toast-success').count(),1);assert.match(await page.locator('.toast-success').innerText(),/წარმატებით/);
 console.log('PASS browser login and confirmed create with one Georgian native success toast');
 await page.locator('#field-title').fill('CMS browser verification updated');await Promise.all([page.waitForResponse(r=>r.url().includes(`/api/slides/${id}`)&&r.request().method()==='PATCH'&&r.status()===200),page.getByRole('button',{name:'შენახვა',exact:true}).click()]);
 console.log('PASS browser update');
 await page.waitForTimeout(4700);
 await page.locator('#field-buttonURL').fill('javascript:alert(1)');await page.getByRole('button',{name:'შენახვა',exact:true}).click();await page.locator('.toast-error').waitFor();assert.equal(await page.locator('.toast-success').count(),0);
 await page.waitForTimeout(5200);assert.equal(await page.locator('.toast-error').count(),1);await page.locator('.toast-error .payload-toast-close-button').click();
 console.log('PASS persistent validation error toast, manual dismissal and no false success');
 await page.locator('#field-buttonURL').fill('/projects');await Promise.all([page.waitForResponse(r=>r.url().includes(`/api/slides/${id}`)&&r.request().method()==='PATCH'&&r.status()===200),page.getByRole('button',{name:'შენახვა',exact:true}).click()]);
 await page.screenshot({path:'/private/tmp/pmc-admin-toast.png',fullPage:true});

 await page.waitForTimeout(4700);
 await page.locator('.doc-controls__popup .popup-button').click();
 await page.getByRole('button',{name:'წაშლა',exact:true}).click();
 await page.locator('#confirm-cancel').waitFor();
 assert.match(await page.locator('.confirmation-modal').innerText(),/ნამდვილად გსურთ/);
 await page.locator('#confirm-cancel').click();assert.equal(await page.locator('.toast-success').count(),0);
 const exists=await page.request.get(`${base}/api/slides/${id}`,{headers:{Origin:new URL(base).origin}});assert.equal(exists.status(),200);
 console.log('PASS delete cancellation preserves record and emits no success');
 await page.locator('.doc-controls__popup .popup-button').click();await page.getByRole('button',{name:'წაშლა',exact:true}).click();
 await Promise.all([page.waitForResponse(r=>r.url().includes(`/api/slides/${id}`)&&r.request().method()==='DELETE'&&r.status()===200),page.locator('#confirm-action').click()]);
 await page.locator('.toast-success').waitFor();id=undefined;
 console.log('PASS confirmed deletion has native success feedback');
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 const animation=await page.locator('.toast-icon svg').first().evaluate(e=>getComputedStyle(e).animationName);assert.equal(animation,'none');
 const bounds=await page.locator('.payload-toast-item').first().boundingBox();assert.ok(bounds.width<=390);
 await page.screenshot({path:'/private/tmp/pmc-admin-mobile-toast.png',fullPage:true});
 console.log('PASS mobile toast sizing and reduced motion');
 for(const path of ['news','projects','project-categories','media','testimonials','statistics','users']){await page.goto(`${base}/admin/collections/${path}`,{waitUntil:'networkidle'});assert.ok(!(await page.locator('body').innerText()).includes('Application error'));}
 for(const path of ['about','site-settings','homepage']){await page.goto(`${base}/admin/globals/${path}`,{waitUntil:'networkidle'});assert.ok(!(await page.locator('body').innerText()).includes('Application error'));}
 console.log('PASS all collection and global admin screens load');
 assert.deepEqual(errors,[]);
 console.log('PASS no admin JavaScript errors');
}finally{
 if(id){const r=await page.request.delete(`${base}/api/slides/${id}`,{headers:{Origin:new URL(base).origin}});assert.equal(r.status(),200);}
 await browser.close();
}
