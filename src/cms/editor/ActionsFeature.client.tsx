'use client';
import {createClientFeature} from '@payloadcms/richtext-lexical/client';
import {$getSelection,$isRangeSelection,$isTextNode,UNDO_COMMAND,REDO_COMMAND,HISTORY_PUSH_TAG} from '@payloadcms/richtext-lexical/lexical';
import {Icon} from '../admin/Icon';
export const ActionsFeatureClient=createClientFeature({toolbarFixed:{groups:[{key:'pmc-history',type:'buttons',order:0,items:[
 {key:'pmc-undo',label:'უკან დაბრუნება (Ctrl/⌘+Z)',ChildComponent:()=> <Icon name="undo" size={18}/>,onSelect:({editor})=>{editor.dispatchCommand(UNDO_COMMAND,undefined);}},
 {key:'pmc-redo',label:'გამეორება (Ctrl/⌘+Shift+Z)',ChildComponent:()=> <Icon name="redo" size={18}/>,onSelect:({editor})=>{editor.dispatchCommand(REDO_COMMAND,undefined);}},
 {key:'pmc-clear',label:'ფორმატირების გასუფთავება',ChildComponent:()=> <Icon name="clear" size={18}/>,onSelect:({editor})=>editor.update(()=>{const selection=$getSelection();if($isRangeSelection(selection)){for(const node of selection.extract())if($isTextNode(node)){node.setFormat(0);node.setStyle('');}selection.format=0;selection.style='';}},{tag:HISTORY_PUSH_TAG})},
]}]}});
