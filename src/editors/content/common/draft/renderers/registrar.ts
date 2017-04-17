
import { Audio } from './Audio';
import { Image } from './Image';
import InlineQuestion from './InlineQuestion';
import { Video } from './Video';
import { YouTube } from './YouTube';
import CodeBlock from './CodeBlock';
import { EmbeddedDocument } from './EmbeddedDocument';
import Unsupported from './Unsupported';
import { PulloutBegin } from './PulloutBegin';
import { PulloutEnd } from './PulloutEnd';
import { SectionBegin } from './SectionBegin';
import { SectionEnd } from './SectionEnd';


import { EntityTypes } from '../../../../../data/content/html/common';
import { register } from './registry';


export default function init() {
  register(EntityTypes.audio, Audio, undefined);
  register(EntityTypes.image, Image, undefined);
  register(EntityTypes.video, Video, undefined);
  register(EntityTypes.youtube, YouTube, undefined);
  register(EntityTypes.codeblock, CodeBlock, undefined);
  register(EntityTypes.document, EmbeddedDocument, undefined);
  register(EntityTypes.unsupported, Unsupported, undefined);
  
  register(EntityTypes.pullout_begin, PulloutBegin, undefined);
  register(EntityTypes.pullout_end, PulloutEnd, undefined);
  register(EntityTypes.section_begin, SectionBegin, undefined);
  register(EntityTypes.section_end, SectionEnd, undefined);
  
  
}