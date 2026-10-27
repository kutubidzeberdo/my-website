import InternalPage from '@/components/InternalPage';
import ContentListing from '@/components/ContentListing';
import {publicNews,publicCard} from '@/lib/cms-public';
export default async function NewsPage(){return <InternalPage><ContentListing kind="news" newsRecords={(await publicNews()).map(publicCard)}/></InternalPage>;}
