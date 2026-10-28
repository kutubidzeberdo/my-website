'use client';
import {createContext,useContext} from 'react';
import type {Language} from '@/data/content';
export const PublicLanguage=createContext<Language>('ka');
export const usePublicLanguage=()=>useContext(PublicLanguage);
