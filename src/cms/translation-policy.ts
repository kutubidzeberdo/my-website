/** Explicit content semantics; these rules never change the stored schema/localization. */
export const englishFields:Record<string,readonly string[]>={
 news:['title','summary','content'],
 projects:['title','summary','content','location','phase','budget','contractor','client','investment','area'],
 slides:['title','subtitle','description','buttonText'],
 testimonials:['title','position','quote'],
 statistics:['title','suffix'],
 about:['title','content','seo.title','seo.description'],
 'project-categories':['title'],
 media:['alt','caption'],
};
export function englishEditable(entity:string,path:readonly string[]):boolean{
 const key=path.join('.');
 if(entity==='homepage')return (path[0]==='sections'&&path[1]!=='metrics')||path[0]==='testimonialsCopy';
 if(entity==='site-settings')return key==='companyName'||key==='address'||(path[0]==='copy'&&!['demo','eyebrow'].includes(path[1]));
 return englishFields[entity]?.includes(key)??false;
}
