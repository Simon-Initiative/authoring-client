import { CompositeDecorator } from 'draft-js';

import unsupported from './Unsupported';
import link from './Link';
import cite from './Cite';
import math from './Math';
import inputRef from './InputRef';
import activityLink from './ActivityLink';
import xref from './Xref';
import quote from './Quote';
import image from './Image';
import formulaBegin from './FormulaBegin';
import formulaEnd from './FormulaEnd';

const decorators = [
  unsupported,
  link,
  cite,
  math,
  inputRef,
  activityLink,
  xref,
  quote,
  image,
];

export function buildCompositeDecorator(props: Object) : CompositeDecorator {
  return new CompositeDecorator(decorators.map(build => build(props)));
}
