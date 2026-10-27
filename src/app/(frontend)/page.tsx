import Website from '@/components/Website';
import {publicHomepage} from '@/lib/cms-public';
export default async function Home(){return <Website data={await publicHomepage()}/>;}
