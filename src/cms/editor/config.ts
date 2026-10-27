import {lexicalEditor,FixedToolbarFeature,HeadingFeature,UploadFeature,BlocksFeature} from '@payloadcms/richtext-lexical';
import {gallery,video} from '../fields';
import {AccessibilityFeature} from './AccessibilityFeature';
import {ActionsFeature} from './ActionsFeature';
export const professionalEditor=lexicalEditor({features:({defaultFeatures})=>[
 AccessibilityFeature(),
 ...defaultFeatures,HeadingFeature({enabledHeadingSizes:['h1','h2','h3','h4']}),FixedToolbarFeature(),ActionsFeature(),
 UploadFeature({collections:{media:{fields:[{name:'alt',type:'text',label:'ალტერნატიული ტექსტი'},{name:'caption',type:'text',label:'წარწერა'}]}}}),
 BlocksFeature({blocks:[{slug:'gallery',admin:{components:{Block:'/src/cms/editor/BlockEditor#BlockEditor'}},labels:{singular:'ფოტოგალერეა',plural:'ფოტოგალერეები'},fields:[gallery,{name:'galleryPreview',type:'ui',admin:{components:{Field:'/src/cms/editor/Previews#GalleryPreview'}}}]},{slug:'video',admin:{components:{Block:'/src/cms/editor/BlockEditor#BlockEditor'}},labels:{singular:'ვიდეო',plural:'ვიდეო'},fields:[video,{name:'videoPreview',type:'ui',admin:{components:{Field:'/src/cms/editor/Previews#VideoPreview'}}}]}]}),
]});
