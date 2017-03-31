
import { Audio } from './Audio';
import { Image } from './Image';
import InlineQuestion from './InlineQuestion';
import { Video } from './Video';
import { YouTube } from './YouTube';
import CodeBlock from './CodeBlock';
import { EmbeddedDocument } from './EmbeddedDocument';
import Unsupported from './Unsupported';

import { BlockTypes } from '../blocktypes';
import { register } from './registry';


export default function init() {
  register(BlockTypes.audio, Audio, undefined);
  register(BlockTypes.image, Image, undefined);
  register(BlockTypes.video, Video, undefined);
  register(BlockTypes.youtube, YouTube, undefined);
  register(BlockTypes.codeblock, CodeBlock, undefined);
  register(BlockTypes.document, EmbeddedDocument, undefined);
  register(BlockTypes.unsupported, Unsupported, undefined);
  
  
}