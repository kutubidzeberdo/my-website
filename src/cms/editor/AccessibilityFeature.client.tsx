'use client';
import type {ComponentType} from 'react';
import {createClientFeature} from '@payloadcms/richtext-lexical/client';
import {$addUpdateTag,type LexicalEditor} from '@payloadcms/richtext-lexical/lexical';
const labels:Record<string,string>={orderedList:'დანომრილი სია',unorderedList:'მარკირებული სია',checklist:'მოსანიშნი სია',upload:'ფოტოს ჩასმა',horizontalRule:'გამყოფი ხაზი',relationship:'ჩანაწერის ბმული',h1:'სათაური 1',h2:'სათაური 2',h3:'სათაური 3',h4:'სათაური 4',paragraph:'აბზაცი',ul:'მარკირებული სია',ol:'დანომრილი სია',blockquote:'ციტატა',link:'ბმულის დამატება / რედაქტირება',bold:'მუქი (Ctrl/⌘+B)',italic:'დახრილი (Ctrl/⌘+I)',underline:'ხაზგასმული (Ctrl/⌘+U)',strikethrough:'გადახაზული',subscript:'ქვედა ინდექსი',superscript:'ზედა ინდექსი',inlineCode:'კოდის სტილი',indentDecrease:'შეწევის შემცირება',indentIncrease:'შეწევის გაზრდა','pmc-undo':'უკან დაბრუნება (Ctrl/⌘+Z)','pmc-redo':'გამეორება (Ctrl/⌘+Shift+Z)','pmc-clear':'ფორმატირების გასუფთავება'};
type Item={key:string;ChildComponent?:ComponentType;onSelect?:(args:{editor:LexicalEditor;isActive:boolean})=>void};
function AccessibleButton({editor,item,active=false,enabled=true}:{editor:LexicalEditor;item:Item;active?:boolean;enabled?:boolean}){
 const Child=item.ChildComponent,label=labels[item.key]||item.key;
 return <button type="button" className={`toolbar-popup__button ${active?'active':''}`} data-button-key={item.key} aria-label={label} title={label} aria-pressed={['bold','italic','underline','strikethrough','subscript','superscript','inlineCode','link'].includes(item.key)?active:undefined} disabled={!enabled} onMouseDown={e=>e.preventDefault()} onClick={()=>editor.focus(()=>{editor.update(()=>{$addUpdateTag('toolbar');});item.onSelect?.({editor,isActive:active});})}>{Child&&<Child/>}</button>;
}
// Public client-feature resolution API: decorate native items, retaining their
// commands, selection logic and disabled state. No DOM mutation or duplicate toolbar.
export const AccessibilityFeatureClient=createClientFeature(({resolvedFeatures})=>{
 for(const feature of resolvedFeatures.values()){for(const group of feature.slashMenu?.groups||[])for(const item of group.items)if(labels[item.key])item.label=labels[item.key];}
 for(const feature of resolvedFeatures.values())for(const group of feature.toolbarFixed?.groups||[]){for(const item of group.items){if(labels[item.key])item.label=labels[item.key];if(group.type==='buttons'&&!item.Component&&item.ChildComponent)item.Component=AccessibleButton;}}
 return {};
});
