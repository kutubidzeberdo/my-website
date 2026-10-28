import type {ImageSize} from 'payload';
// Width-only, uncropped: existing cards have different proportions. Next Image
// still serves responsive widths, and CSS performs the only visible cover crop.
export const cardWidth=960;
export const cardQuality=85;
export const cardSize:ImageSize={name:'card',width:cardWidth,fit:'inside',formatOptions:{format:'webp',options:{quality:cardQuality}},generateImageName:({originalName,width,height,extension})=>`${originalName}-card-${width}x${height}.${extension}`};
