'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Toaster,toast} from 'sonner';

export default function ContactSuccessToast({notification,message,language}:{notification:number;message:string;language:'ka'|'en'}) {
  const id=useId();
  const active=useRef(false);
  const shown=useRef(0);
  const [mobile,setMobile]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia('(max-width: 600px)');
    const update=()=>setMobile(media.matches);
    update();media.addEventListener('change',update);
    return ()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>()=>{active.current=false;toast.dismiss(id);},[id]);
  useEffect(()=>{
    // Translate an active toast, but never revive a notification that already closed.
    if(!notification||(shown.current===notification&&!active.current))return;
    shown.current=notification;active.current=true;
    toast.success(message,{id,duration:5000,onDismiss:()=>{active.current=false;},onAutoClose:()=>{active.current=false;}});
  },[notification,message,id]);
  return <Toaster theme="light" richColors position={mobile?'top-center':'top-right'} duration={5000}
    containerAriaLabel={language==='ka'?'შეტყობინებები':'Notifications'}
    toastOptions={{style:{fontFamily:'inherit',borderRadius:14,padding:'16px 20px',boxShadow:'0 12px 36px rgba(21, 32, 51, 0.14)'}}}/>;
}
