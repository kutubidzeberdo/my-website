const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const {renderToStaticMarkup}=require('react-dom/server');
function load(file,mocks={}) {
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('module','exports','require',code)(module,module.exports,id=>id in mocks?mocks[id]:require(id));
  return module.exports;
}
const {privacy}=load('src/data/privacy.ts');
const settings={companyName:'PMC',email:'privacy@example.invalid',phone:'123',telephoneHref:'tel:123',address:'Office'};
const CMSContext={useCMS:()=>({settings})};

test('Both policy routes render their URL language and localized contact details',async()=>{
  const PrivacyPage=load('src/components/PrivacyPage.tsx',{
    './InternalPage':({children})=>children,'./CMSContext':CMSContext,'@/data/privacy':{privacy},
  }).default;
  const route=load('src/app/(frontend)/[language]/privacy/page.tsx',{
    'next/navigation':{notFound:()=>{throw Error('NOT_FOUND');}},
    '@/components/PrivacyPage':PrivacyPage,'@/data/privacy':{privacy},
  });
  for(const language of ['ka','en']) {
    const props={params:Promise.resolve({language})};
    const html=renderToStaticMarkup(await route.default(props));
    assert.ok(html.includes(`lang="${language}"`));
    assert.ok(html.includes(privacy[language].title));
    assert.ok(html.includes('mailto:privacy@example.invalid'));
    assert.ok(html.includes('https://policies.google.com/privacy'));
    assert.equal(privacy[language].sections.length,8);
    const metadata=await route.generateMetadata(props);
    assert.equal(metadata.alternates.canonical,`/${language}/privacy`);
    assert.deepEqual(metadata.alternates.languages,{ka:'/ka/privacy',en:'/en/privacy'});
  }
  await assert.rejects(route.default({params:Promise.resolve({language:'fr'})}),/NOT_FOUND/);
});

test('Footer points each language at its corresponding public policy',()=>{
  const Footer=load('src/components/Footer.tsx',{
    'next/image':()=>null,'./CMSContext':{useCMS:()=>({settings:{...settings,copy:{nav:[],footerTitles:[]}}})},
    '@/data/content':{content:{en:{nav:[],footerTitles:[]}}},
  }).default;
  for(const language of ['ka','en']) {
    const html=renderToStaticMarkup(require('react').createElement(Footer,{language}));
    assert.ok(html.includes(`href="/${language}/privacy"`));
    assert.ok(html.includes(privacy[language].title));
  }
});
