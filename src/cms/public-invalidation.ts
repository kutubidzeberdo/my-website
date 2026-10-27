import {revalidatePath} from 'next/cache';
/** Invoked only after authorized CMS writes; no public invalidation endpoint. */
export function invalidatePublic(){try{revalidatePath('/','layout');}catch{/* Local API CLI/tests have no Next request store. Public routes are also force-dynamic. */}}
