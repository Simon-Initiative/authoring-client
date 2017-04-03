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

export const EntityTypes = types.strEnum([
  'CODEBLOCK',
  'BDO',
  'EXTERNAL_LINK',
  'INTERNAL_LINK',
  'IMAGE',
  'TABLE',
  'ACTIVITY_LINK',
  'COMMAND',
  'TEST_AND_CONFIGURE',
  'IFRAME',
  'APPLET',
  'AUDIO',
  'DIRECTOR',
  'FLASH',
  'MATHEMATICA',
  'PANOPTO',
  'UNITY',
  'VIDEO',
  'YOUTUBE',
  'UNSUPPORTED'
])

export type EntityTypes = keyof typeof EntityTypes;