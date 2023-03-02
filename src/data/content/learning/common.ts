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
    url: 'http://creativecommons.org/licenses/by-nc-nd/3.0/',
  },
];

export interface Title {
  type: 'title';
}

export interface Empty {
  type: '';
}



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

export const ARRAY = '#array';
export const TITLE = '@title';
export const STYLE = '@style';
export const TEXT = '#text';
export const CDATA = '#cdata';
