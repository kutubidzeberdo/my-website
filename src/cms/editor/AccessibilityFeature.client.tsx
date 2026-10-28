'use client';
import {useTranslation} from '@payloadcms/ui';
import type {ComponentType} from 'react';
import {createClientFeature} from '@payloadcms/richtext-lexical/client';
import {$addUpdateTag,type LexicalEditor} from '@payloadcms/richtext-lexical/lexical';
const labels:Record<string,string>={orderedList:'დანომრილი სია',unorderedList:'მარკირებული სია',checklist:'მოსანიშნი სია',upload:'ფოტოს ჩასმა',horizontalRule:'გამყოფი ხაზი',relationship:'ჩანაწერის ბმული',h1:'სათაური 1',h2:'სათაური 2',h3:'სათაური 3',h4:'სათაური 4',paragraph:'აბზაცი',ul:'მარკირებული სია',ol:'დანომრილი სია',blockquote:'ციტატა',link:'ბმულის დამატება / რედაქტირება',bold:'მუქი (Ctrl/⌘+B)',italic:'დახრილი (Ctrl/⌘+I)',underline:'ხაზგასმული (Ctrl/⌘+U)',strikethrough:'გადახაზული',subscript:'ქვედა ინდექსი',superscript:'ზედა ინდექსი',inlineCode:'კოდის სტილი',indentDecrease:'შეწევის შემცირება',indentIncrease:'შეწევის გაზრდა','pmc-undo':'უკან დაბრუნება (Ctrl/⌘+Z)','pmc-redo':'გამეორება (Ctrl/⌘+Shift+Z)','pmc-clear':'ფორმატირების გასუფთავება'};
const english:Record<string,string>={orderedList:'Numbered List',unorderedList:'Bulleted List',checklist:'Checklist',upload:'Insert Image',horizontalRule:'Horizontal Rule',relationship:'Document Link',h1:'Heading 1',h2:'Heading 2',h3:'Heading 3',h4:'Heading 4',paragraph:'Paragraph',ul:'Bulleted List',ol:'Numbered List',blockquote:'Quote',link:'Add / Edit Link',bold:'Bold (Ctrl/⌘+B)',italic:'Italic (Ctrl/⌘+I)',underline:'Underline (Ctrl/⌘+U)',strikethrough:'Strikethrough',subscript:'Subscript',superscript:'Superscript',inlineCode:'Inline Code',indentDecrease:'Decrease Indent',indentIncrease:'Increase Indent','pmc-undo':'Undo (Ctrl/⌘+Z)','pmc-redo':'Redo (Ctrl/⌘+Shift+Z)','pmc-clear':'Clear Formatting'};
type Item={key:string;ChildComponent?:ComponentType;onSelect?:(args:{editor:LexicalEditor;isActive:boolean})=>void};
function AccessibleButton({editor,item,active=false,enabled=true}:{editor:LexicalEditor;item:Item;active?:boolean;enabled?:boolean}){
 const {i18n}=useTranslation();const Child=item.ChildComponent,label=(i18n.language==='en'?english:labels)[item.key]||item.key;
 return <button type="button" className={`toolbar-popup__button ${active?'active':''}`} data-button-key={item.key} aria-label={label} title={label} aria-pressed={['bold','italic','underline','strikethrough','subscript','superscript','inlineCode','link'].includes(item.key)?active:undefined} disabled={!enabled} onMouseDown={e=>e.preventDefault()} onClick={()=>editor.focus(()=>{editor.update(()=>{$addUpdateTag('toolbar');});item.onSelect?.({editor,isActive:active});})}>{Child&&<Child/>}</button>;
}
// Public client-feature resolution API: decorate native items, retaining their
// commands, selection logic and disabled state. No DOM mutation or duplicate toolbar.
export const AccessibilityFeatureClient=createClientFeature(({resolvedFeatures})=>{
 for(const feature of resolvedFeatures.values()){for(const group of feature.slashMenu?.groups||[])for(const item of group.items)if(labels[item.key])item.label=({i18n})=>(i18n.language==='en'?english:labels)[item.key];}
 for(const feature of resolvedFeatures.values())for(const group of feature.toolbarFixed?.groups||[]){for(const item of group.items){if(labels[item.key])item.label=({i18n})=>(i18n.language==='en'?english:labels)[item.key];if(group.type==='buttons'&&!item.Component&&item.ChildComponent)item.Component=AccessibleButton;}}
 return {};
});
