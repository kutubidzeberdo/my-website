'use client';
import {useEffect} from 'react';
import {RenderFields,useFormFields} from '@payloadcms/ui';
import {reduceFieldsToValues} from 'payload/shared';
import {useBlockComponentContext,$isBlockNode} from '@payloadcms/richtext-lexical/client';
import {$getNodeByKey,SKIP_DOM_SELECTION_TAG} from '@payloadcms/richtext-lexical/lexical';
import {useLexicalComposerContext} from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext';
import {useLexicalEditable} from '@payloadcms/richtext-lexical/lexical/react/useLexicalEditable';

/** Native block controls/fields, with immediate draft synchronization. */
export function BlockEditor(){
 const {BlockCollapsible,formSchema,nodeKey}=useBlockComponentContext();const [editor]=useLexicalComposerContext();const editable=useLexicalEditable();
 const values=useFormFields(([fields])=>JSON.stringify(reduceFieldsToValues(fields,true)));
 useEffect(()=>{
  if(!editable||!nodeKey)return;
  const data=JSON.parse(values);
  editor.update(()=>{const node=$getNodeByKey(nodeKey);if(!$isBlockNode(node))return;const current=node.getFields();const next={...current,...data,blockType:current.blockType};if(JSON.stringify(current)!==JSON.stringify(next))node.setFields(next,true);},{tag:SKIP_DOM_SELECTION_TAG});
 },[values,nodeKey,editor,editable]);
 return <BlockCollapsible><RenderFields fields={formSchema} forceRender parentIndexPath="" parentPath="" parentSchemaPath="" permissions={true} readOnly={!editable}/></BlockCollapsible>;
}
