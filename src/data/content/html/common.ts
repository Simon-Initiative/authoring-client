import * as types from '../../types';

export type PurposeType = {
  value: string,
  label: string
}

export const PurposeTypes : PurposeType[] = [
  { value: 'checkpoint', label: 'Checkpoint'},
  { value: 'lab', label: 'Lab'},
  { value: 'learnbydoing', label: 'Learn by doing'},
  { value: 'learnmore', label: 'Learn more'},
  { value: 'manystudentswonder', label: 'Many students wonder'},
  { value: 'myresponse', label: 'My response'},
  { value: 'quiz', label: 'Quiz'},
  { value: 'simulation', label: 'Simulation'},
  { value: 'walkthrough', label: 'Walkthrough'},
  { value: 'didigetthis', label: 'Did I get this?'}
];

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
  'input_ref',
  
  // Block entities
  'codeblock',
  'objref',
  'wb_inline',
  'table',
  'audio',
  'video',
  'youtube',
  'unsupported'
])

export type EntityTypes = keyof typeof EntityTypes;

export type BlockData = PulloutBegin | PulloutEnd | SectionBegin | SectionEnd | ExampleBegin | ExampleEnd | Title | Empty;

export interface PulloutBegin {
  type: 'pullout_begin';
  subType: string;
}

export interface PulloutEnd {
  type: 'pullout_end';
  beginBlockKey: string;
  subType: string;
}

export interface SectionBegin {
  type: 'section_begin';
  purpose: string;
}

export interface SectionEnd {
  type: 'section_end';
  beginBlockKey: string;
  purpose: string;
}

export interface ExampleBegin {
  type: 'example_begin';
}

export interface ExampleEnd {
  type: 'example_end';
  beginBlockKey: string;
}

export interface Title {
  type: 'title';
  beginBlockKey: string;
}

export interface Empty {
  type: ''
}


export type RawInlineStyle = {
  offset: number,
  length: number,
  style: string 
};

export type RawEntityRange = {
  offset: number,
  length: number,
  key: string
}

export type RawContentBlock = {
  key: string,
  text: string,
  type: string,
  depth: number,
  inlineStyleRanges: RawInlineStyle[],
  entityRanges: RawEntityRange[],
  data: any
};

export type RawEntity = {
  type: string,
  mutability: string,
  data: Object
};

export function getKey(item) {
  return Object.keys(item).filter(k => !k.startsWith('@'))[0];
}

const seenKeys = {};
const MULTIPLIER = Math.pow(2, 24);

export function generateRandomKey(): string {
  let key;
  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }
  seenKeys[key] = true;
  return key;
}

export type RawEntityMap = Object;

export type RawDraft = {
  entityMap : RawEntityMap,
  blocks: RawContentBlock[]
};

export const ARRAY = '#array';
export const TITLE = '@title';
export const STYLE = '@style';
export const TEXT = '#text';
export const CDATA = '#cdata';

export const styleMap = {};
const addStyle = (oliStyle, draftStyle) => {
  styleMap[oliStyle] = draftStyle;
  styleMap[draftStyle] = oliStyle;
}


addStyle('bold', 'BOLD');
addStyle('italic', 'ITALIC');
addStyle('var', 'CODE');
addStyle('cite', 'CITE');
addStyle('term', 'TERM');
addStyle('ipa', 'IPA');
addStyle('foreign', 'FOREIGN');
addStyle('var', 'CODE');
addStyle('sub', 'SUBSCRIPT');
addStyle('sup', 'SUPERSCRIPT');

export const emStyles = {
  bold: true,
  italic: true
}


export const sectionBlockStyles = {
  1: 'header-one',
  2: 'header-two',
  3: 'header-three',
  4: 'header-four',
  5: 'header-five',
  6: 'header-six'
};

export const blockStylesMap = {
  'header-one': 1,
  'header-two': 2,
  'header-three': 3,
  'header-four': 4,
  'header-five': 5,
  'header-six': 6,
}