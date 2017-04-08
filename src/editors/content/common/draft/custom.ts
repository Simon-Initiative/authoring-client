import * as types from '../../../../data/types';

export const EntityTypes = types.strEnum([

  // Sentinals
  'pullout_begin',
  'pullout_end',
  'example_begin',
  'example_end',
  'figure_begin',
  'figure_end',
  'section_begin',
  'section_end',

  // Inline entities
  'activity_link',
  'code',
  'formula',
  'quote',
  'bdo',
  'link',
  'xref',
  'wb_manual',
  'cite',
  'image',
  
  // Block entities
  'codeblock',
  'objref',
  'wb_inline',
  'table',
  'audio',
  'video',
  'youtube',
  'unsupported',
  'document'
])

export type EntityTypes = keyof typeof EntityTypes;