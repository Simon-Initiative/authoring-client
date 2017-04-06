import * as types from '../../../../data/types';

export const EntityTypes = types.strEnum([
  'pullout_begin',
  'pullout_end',
  'example_begin',
  'example_end',
  'figure-begin',
  'figure-end',
  'code',
  'formula',
  'quote',
  'codeblock',
  'bdo',
  'link',
  'cite',
  'image',
  'table',
  'activity_link',
  'command',
  'test_and_configure',
  'iframe',
  'applet',
  'audio',
  'director',
  'flash',
  'mathematica',
  'panopto',
  'unity',
  'video',
  'youtube',
  'unsupported',
  'document'
])

export type EntityTypes = keyof typeof EntityTypes;