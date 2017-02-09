
import { Audio } from './Audio';
import { Image } from './Image';
import InlineQuestion from './InlineQuestion';
import { Video } from './Video';
import { YouTube } from './YouTube'

import { register } from './registry';

export default function init() {
  register('audio', Audio, undefined);
  register('image', Image, undefined);
  register('video', Video, undefined);
  register('youtube', YouTube, undefined);
  
  register('inline-question', InlineQuestion, undefined);
}