import os from 'node:os';
import path from 'node:path';
import type {Config} from 'payload';

// Stream multipart bodies to disk instead of retaining arbitrarily large originals in RAM.
// Native Payload operations clean their temporary files on success and failure.
export const mediaUploadOptions:Config['upload']={
 limits:{fileSize:Infinity},requestSizeLimit:Infinity,useTempFiles:true,
 tempFileDir:path.join(os.tmpdir(),'pmc-uploads'),
};
