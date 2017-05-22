
import Audio from './Audio';
import { Image } from './Image';
import Video from './Video';
import YouTube from './YouTube';
import IFrame from './IFrame';
import CodeBlock from './CodeBlock';
import Unsupported from './Unsupported';
import { PulloutBegin } from './PulloutBegin';
import { PulloutEnd } from './PulloutEnd';
import { SectionBegin } from './SectionBegin';
import { SectionEnd } from './SectionEnd';
import { ExampleBegin } from './ExampleBegin';
import { ExampleEnd } from './ExampleEnd';
import { WbInline } from './WbInline';
import { Table } from './Table';
import { DefinitionBegin } from './DefinitionBegin';
import { DefinitionEnd } from './DefinitionEnd';
import { TitleBegin } from './TitleBegin';
import { TitleEnd } from './TitleEnd';
import { PronunciationBegin } from './PronunciationBegin';
import { PronunciationEnd } from './PronunciationEnd';
import { TranslationBegin } from './TranslationBegin';
import { TranslationEnd } from './TranslationEnd';
import { MeaningBegin } from './MeaningBegin';
import { MeaningEnd } from './MeaningEnd';

import { EntityTypes } from '../../../../../data/content/html/common';
import { register } from './registry';


export default function init() {
  register(EntityTypes.audio, Audio, undefined);
  register(EntityTypes.image, Image, undefined);
  register(EntityTypes.video, Video, undefined);
  register(EntityTypes.youtube, YouTube, undefined);
  register(EntityTypes.codeblock, CodeBlock, undefined);
  register(EntityTypes.unsupported, Unsupported, undefined);
  register(EntityTypes.pullout_begin, PulloutBegin, undefined);
  register(EntityTypes.pullout_end, PulloutEnd, undefined);
  register(EntityTypes.section_begin, SectionBegin, undefined);
  register(EntityTypes.section_end, SectionEnd, undefined);  
  register(EntityTypes.example_begin, ExampleBegin, undefined);
  register(EntityTypes.example_end, ExampleEnd, undefined); 
  
  register(EntityTypes.definition_begin, DefinitionBegin, undefined);
  register(EntityTypes.definition_end, DefinitionEnd, undefined);
  register(EntityTypes.title_begin, TitleBegin, undefined);  
  register(EntityTypes.title_end, TitleEnd, undefined);
  register(EntityTypes.pronunciation_begin, PronunciationBegin, undefined);
  register(EntityTypes.pronunciation_end, PronunciationEnd, undefined);
  register(EntityTypes.translation_begin, TranslationBegin, undefined);
  register(EntityTypes.translation_end, TranslationEnd, undefined);
  register(EntityTypes.meaning_begin, MeaningBegin, undefined);
  register(EntityTypes.meaning_end, MeaningEnd, undefined);


  register(EntityTypes.wb_inline, WbInline, undefined);  
  register(EntityTypes.table, Table, undefined);
  register(EntityTypes.iframe, IFrame, undefined);
}
