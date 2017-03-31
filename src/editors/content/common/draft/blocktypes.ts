import * as types from '../../../../data/types';

export const BlockTypes = types.strEnum([
  'audio',
  'video',
  'image',
  'youtube',
  'codeblock',
  'document',
  'unsupported'
])

export type BlockTypes = keyof typeof BlockTypes;