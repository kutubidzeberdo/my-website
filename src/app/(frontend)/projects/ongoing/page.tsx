import InternalPage from '@/components/InternalPage';
import ContentListing from '@/components/ContentListing';
import {publicProjects,publicCard} from '@/lib/cms-public';
export default async function OngoingPage(){return <InternalPage><ContentListing kind="projects" projectRecords={(await publicProjects()).map(publicCard)} ongoing/></InternalPage>;}
