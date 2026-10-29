// Run against the production server: CMS_TEST_URL=http://127.0.0.1:3124 node tests/facebook-sharing.browser.mjs
// Only public GET requests; the Facebook popup is intercepted, never posted to Facebook.
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
const base=process.env.CMS_TEST_URL||'http://127.0.0.1:3124';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  const context=await browser.newContext();
  await context.route('https://www.facebook.com/**',route=>route.fulfill({contentType:'text/html',body:'Sharing destination intercepted for verification.'}));
  const page=await context.newPage();
  for(const [kind,slug] of [['news','planning'],['projects','batumi-arena']])for(const language of ['ka','en']) {
    const path=`/${kind}/${slug}${language==='en'?'?lang=en':''}`;
    const canonical='https://www.stadium.ge'+path;
    // A crawler has no browser storage or session: inspect the actual response HTML.
    const response=await fetch(base+path,{headers:{'User-Agent':'facebookexternalhit/1.1'}});
    assert.equal(response.status,200);
    const html=await response.text();
    const data=await page.evaluate(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      return {og:Object.fromEntries([...doc.head.querySelectorAll('meta[property^="og:"]')].map(e=>[e.getAttribute('property'),e.content])),canonical:doc.head.querySelector('link[rel=canonical]')?.href,share:doc.querySelector('.facebook-share')?.getAttribute('href')};
    },html);
    const records=await fetch(`${base}/api/${kind}?where[slug][equals]=${slug}&locale=${language}`).then(r=>r.json());
    assert.ok(records.docs?.length,'Existing published CMS item is accessible');
    assert.equal(data.og['og:title'],records.docs[0].title);
    assert.ok(data.og['og:description']?.trim());
    assert.equal(data.og['og:url'],canonical);assert.equal(data.canonical,canonical);
    assert.equal(data.og['og:type'],kind==='news'?'article':'website');
    assert.equal(data.og['og:locale'],language==='en'?'en_US':'ka_GE');
    assert.ok(data.og['og:image'].startsWith('https://www.stadium.ge/api/media/file/'));
    const image=await fetch(data.og['og:image'],{headers:{'User-Agent':'facebookexternalhit/1.1'}});
    assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/^image\//);assert.ok((await image.arrayBuffer()).byteLength>0);
    assert.equal(new URL(data.share).searchParams.get('u'),canonical);
    await page.goto(base+path);await page.locator('.facebook-share').waitFor();
    assert.equal(await page.locator('.facebook-share').getAttribute('rel'),'noopener noreferrer');
    assert.equal(await page.locator('.facebook-share svg').count(),1);
    assert.equal(await page.locator('.facebook-share').innerText(),language==='en'?'Share on Facebook':'Facebook-ზე გაზიარება');
    const [popup]=await Promise.all([context.waitForEvent('page'),page.locator('.facebook-share').click()]);
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(new URL(popup.url()).origin,'https://www.facebook.com');
    assert.equal(new URL(popup.url()).pathname,'/sharer/sharer.php');
    assert.equal(new URL(popup.url()).searchParams.get('u'),canonical);
    await popup.close();
    // The existing language control updates the shareable query and localized server content.
    const next=language==='ka'?'en':'ka';
    await page.locator(`.languages button[lang=${next}]`).click();
    await page.waitForURL(url=>url.searchParams.get('lang')===next);
    await page.waitForFunction(locale=>document.querySelector('meta[property="og:locale"]')?.content===locale,next==='en'?'en_US':'ka_GE');
    assert.equal(new URL(await page.locator('.facebook-share').getAttribute('href')).searchParams.get('u'),`https://www.stadium.ge/${kind}/${slug}${next==='en'?'?lang=en':''}`);
    console.log(`PASS ${kind}/${slug} ${language}: raw server OG tags, real CMS title/image, public image, official encoded share popup and language switching`);
  }
} finally {await browser.close();}
