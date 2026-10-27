'use client';
import { useEffect } from 'react';
import { toast } from '@payloadcms/ui';

/** Extend existing native errors in place; Payload bundles its own toast instance. */
export function NotificationPolicy({children}:{children:React.ReactNode}) {
 useEffect(()=>{
  const extended=new Set<string|number>();
  const preserveErrors=()=>{
   for(const notification of toast.getToasts()){
    if('type' in notification && notification.type==='error' && notification.duration!==Infinity && !extended.has(notification.id)){
     extended.add(notification.id);
     toast.error(notification.title,{id:notification.id,duration:Infinity,dismissible:true,description:notification.description});
    }
   }
  };
  preserveErrors();
  const timer=window.setInterval(preserveErrors,150);
  return ()=>window.clearInterval(timer);
 },[]);
 return children;
}
