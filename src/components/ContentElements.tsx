export function PageHeading({children}:{children:React.ReactNode}){return <h1 className="page-heading">{children}</h1>;}
export function ProjectProgress({value}:{value:number}){return <div className="record-progress"><strong>{value}%</strong><progress max={100} value={value} aria-label="პროექტის საილუსტრაციო პროგრესი"/></div>;}
export {default as PhotoGallery} from './PhotoGallery';
export function YoutubeVideo({id}:{id?:string}){return id&&/^[\w-]{11}$/.test(id)?<iframe className="youtube-video" title="ვიდეო" src={`https://www.youtube-nocookie.com/embed/${id}`} loading="lazy" allowFullScreen/>:null;}
export {default as FacebookShareButton} from './FacebookShareButton';
