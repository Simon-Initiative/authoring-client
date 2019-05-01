export enum LinkTarget {
  New = 'new',
  Self = 'self',
}

export enum Orientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export type PurposeType = {
  value: string,
  label: string,
};

// tslint:disable-next-line
export const PurposeTypes: PurposeType[] = [
  { value: 'myresponse', label: 'My response' },
  { value: 'checkpoint', label: 'Checkpoint' },
  { value: 'lab', label: 'Lab' },
  { value: 'learnbydoing', label: 'Learn by doing' },
  { value: 'learnmore', label: 'Learn more' },
  { value: 'manystudentswonder', label: 'Many students wonder' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'walkthrough', label: 'Walkthrough' },
  { value: 'didigetthis', label: 'Did I get this?' },
];

export type PackageLicenseType = { acronym: string, description: string, url: string };
export const PackageLicenseTypes: PackageLicenseType[] = [
  {
    acronym: '',
    description: 'Non-CC / Copyrighted / Other',
    url: '',
  },
  {
    acronym: 'CCBy',
    description: 'CC BY: Attribtion',
    url: 'https://creativecommons.org/licenses/by/3.0/',
  },
  {
    acronym: 'CCBySA',
    description: 'CC BY-SA: Attribution-ShareAlike',
    url: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    acronym: 'CCByND',
    description: 'CC BY-ND: Attribution-NoDerivatives',
    url: 'https://creativecommons.org/licenses/by-nd/3.0/',
  },
  {
    acronym: 'CCByNC',
    description: 'CC BY-NC: Attribution-NonCommercial',
    url: 'https://creativecommons.org/licenses/by-nc/3.0/',
  },
  {
    acronym: 'CCByNCSA',
    description: 'CC BY-NC-SA: Attribution-NonCommercial-ShareAlike',
    url: 'http://creativecommons.org/licenses/by-nc-sa/3.0/',
  },
  {
    acronym: 'CCByNCND',
    description: 'CC BY-NC-ND: Attribution-NonCommercial-NoDerivatives',
    url: 'http://creativecommons.org/licenses/by-nc-sa/3.0/',
  },
];

export enum EntityTypes {

  // Inline sentinels
  formula_begin = 'formula_begin',
  formula_end = 'formula_end',

  // Inline entities
  activity_link = 'activity_link',
  command = 'command',
  extra = 'extra',
  sym = 'sym',
  link = 'link',
  image_link = 'image_link',
  image_activity_link = 'image_activity_link',
  code = 'code',
  formula = 'formula',
  math = 'math',
  quote = 'quote',
  bdo = 'bdo',
  xref = 'xref',
  wb_manula = 'wb_manual',
  cite = 'cite',
  image = 'image',
  input_ref = 'input_ref',

  unsupported = 'unsupported',
}

export interface Title {
  type: 'title';
}

export interface Empty {
  type: '';
}


export type RawInlineStyle = {
  offset: number,
  length: number,
  style: string,
};

export type RawEntityRange = {
  offset: number,
  length: number,
  key: string,
};

export type RawContentBlock = {
  key: string,
  text: string,
  type: string,
  depth: number,
  inlineStyleRanges: RawInlineStyle[],
  entityRanges: RawEntityRange[],
  data: any,
};

export type RawEntity = {
  type: string,
  mutability: string,
  data: Object,
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
  entityMap: RawEntityMap,
  blocks: RawContentBlock[],
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
};


addStyle('bold', 'BOLD');
addStyle('italic', 'ITALIC');
addStyle('emphasis', 'EMPHASIS');
addStyle('deemphasis', 'DEEMPHASIS');
addStyle('highlight', 'HIGHLIGHT');
addStyle('line-through', 'STRIKETHROUGH');
addStyle('oblique', 'OBLIQUE');
addStyle('var', 'VAR');
addStyle('bdo', 'BDO');
addStyle('cite', 'CITE');
addStyle('term', 'TERM');
addStyle('ipa', 'IPA');
addStyle('foreign', 'FOREIGN');
addStyle('sub', 'SUBSCRIPT');
addStyle('sup', 'SUPERSCRIPT');
addStyle('quote', 'QUOTE');

export const emStyles = {
  bold: true,
  italic: true,
  emphasis: true,
  deemphasis: true,
  highlight: true,
  'line-through': true,
  oblique: true,
};


export const sectionBlockStyles = {
  1: 'header-one',
  2: 'header-two',
  3: 'header-three',
  4: 'header-four',
  5: 'header-five',
  6: 'header-six',
};

export const blockStylesMap = {
  'header-one': 1,
  'header-two': 2,
  'header-three': 3,
  'header-four': 4,
  'header-five': 5,
  'header-six': 6,
};
