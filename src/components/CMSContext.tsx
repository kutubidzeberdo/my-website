'use client';
import {createContext,useContext} from 'react';import type {PublicShell} from '@/lib/cms-model';
const Context=createContext<PublicShell|null>(null);
export function CMSProvider({value,children}:{value:PublicShell;children:React.ReactNode}){return <Context.Provider value={value}>{children}</Context.Provider>;}
export function useCMS(){const value=useContext(Context);if(!value)throw new Error('Public CMS context unavailable');return value;}
