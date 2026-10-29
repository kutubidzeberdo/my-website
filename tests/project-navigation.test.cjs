const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),req=createRequire(path.join(root,'package.json')),ts=req('typescript');
function load(file,cache=new Map()){if(cache.has(file))return cache.get(file);const module={exports:{}};cache.set(file,module.exports);const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('require','module','exports',js)(id=>id.startsWith('@/')?load(path.join(root,'src',id.slice(2)+(fs.existsSync(path.join(root,'src',id.slice(2)+'.ts'))?'.ts':'.tsx')),cache):id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx')),cache):req(id),module,module.exports);return module.exports;}
// Fixtures test shared URL/metadata behavior; public records now come from PostgreSQL.
const projectRecords=[{id:'batumi-arena',name:{ka:'ბათუმი არენა'},description:{ka:'პროექტის აღწერა'},image:'/images/arena.jpg'}];const newsRecords=[{id:'planning',title:{ka:'სიახლე'},body:{ka:'სტატიის აღწერა'},image:'/images/construction.jpg'}];
test('All project IDs are unique valid detail slugs, distinct from listing routes',()=>{const ids=projectRecords.map(p=>p.id);assert.equal(new Set(ids).size,ids.length);for(const id of ids){assert.match(id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(!['ongoing','completed'].includes(id));}for(const listing of ['ongoing','completed'])assert.ok(fs.existsSync(path.join(root,'src/app/(frontend)/projects',listing,'page.tsx')));});
test('Every detail generates its own canonical and featured-image metadata',()=>{const old=process.env.NEXT_PUBLIC_SITE_URL;try{process.env.NEXT_PUBLIC_SITE_URL='https://example.org';const {recordMetadata}=load(path.join(root,'src/lib/site-metadata.ts'));for(const [kind,records] of [['projects',projectRecords],['news',newsRecords]])for(const record of records){const title=(record.name||record.title).ka,description=(record.description||record.body).ka;const result=recordMetadata(title,description,record.image,`/${kind}/${record.id}`,kind==='news');assert.equal(result.alternates.canonical,`https://example.org/${kind}/${record.id}`);assert.equal(result.openGraph.url,result.alternates.canonical);assert.equal(result.openGraph.images[0].url,'https://example.org'+record.image);assert.equal(result.openGraph.title,title);assert.equal(result.openGraph.description,description);assert.equal(result.twitter.card,'summary_large_image');}}finally{if(old===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=old;}});
test('Facebook button has an icon and encoded unique page URL',()=>{const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');const Share=load(path.join(root,'src/components/FacebookShareButton.tsx')).default;for(const record of projectRecords){const url=`https://example.org/projects/${record.id}`;const html=renderToStaticMarkup(React.createElement(Share,{url}));assert.ok(html.includes('Facebook-ზე გაზიარება'));assert.ok(html.includes('<svg'));assert.ok(html.includes('u='+encodeURIComponent(url)));assert.ok(html.includes('noopener noreferrer'));}});
test('Facebook button remains visible before local browser URL hydration',()=>{const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');const Share=load(path.join(root,'src/components/FacebookShareButton.tsx')).default;const html=renderToStaticMarkup(React.createElement(Share));assert.ok(html.includes('Facebook-ზე გაზიარება'));assert.ok(html.includes('<button'));});

test('Shared page URLs retain the exact item, force public HTTPS and preserve English without cookies',()=>{
 const {sharedPageURL,shareMetadata}=load(path.join(root,'src/lib/facebook-sharing.ts'));
 for(const kind of ['news','projects'])for(const language of ['ka','en']){
  const path=`/${kind}/${encodeURIComponent('ქართული სტატია')}`;
  const url=sharedPageURL(path+'?tracking=ignored#section',language);
  assert.equal(url,`https://www.stadium.ge${path}${language==='en'?'?lang=en':''}`);
  const metadata=shareMetadata('Item title','  Specific\nitem description  ','/api/media/file/photo.jpg',path,kind==='news',language);
  assert.equal(metadata.openGraph.url,url);
  assert.equal(metadata.alternates.canonical,url);
  assert.equal(metadata.openGraph.title,'Item title');
  assert.equal(metadata.openGraph.description,'Specific item description');
  assert.equal(metadata.openGraph.images[0].url,'https://www.stadium.ge/api/media/file/photo.jpg');
  assert.equal(metadata.openGraph.locale,language==='en'?'en_US':'ka_GE');
  assert.equal(metadata.openGraph.type,kind==='news'?'article':'website');
  assert.equal(metadata.alternates.languages.en,`https://www.stadium.ge${path}?lang=en`);
 }
 const fallback=shareMetadata('Real title','  ','data:image/svg+xml,placeholder','/news/item',true,'en');
 assert.equal(fallback.description,'Real title');assert.equal(fallback.openGraph.images,undefined);
 assert.equal(shareMetadata('Title','Text','http://private.invalid/image.jpg','/news/item',true,'ka').openGraph.images,undefined);
});

test('Facebook sharing is localized and renders a safe official link before hydration',()=>{
 const cache=new Map();const {PublicLanguage}=load(path.join(root,'src/components/PublicLanguage.tsx'),cache);
 const Share=load(path.join(root,'src/components/FacebookShareButton.tsx'),cache).default;
 const React=req('react'),{renderToStaticMarkup}=req('react-dom/server');
 for(const language of ['ka','en']){
  const url=`https://www.stadium.ge/news/planning${language==='en'?'?lang=en':''}`;
  const html=renderToStaticMarkup(React.createElement(PublicLanguage.Provider,{value:language},React.createElement(Share,{url})));
  assert.ok(html.includes('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url)));
  assert.ok(html.includes(language==='en'?'Share on Facebook':'Facebook-ზე გაზიარება'));
  assert.ok(html.includes('target="_blank"'));assert.ok(html.includes('rel="noopener noreferrer"'));
 }
});
