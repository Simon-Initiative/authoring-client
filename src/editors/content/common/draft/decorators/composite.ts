import { CompositeDecorator } from 'draft-js';

import unsupported from './Unsupported';
import link from './Link';
import cite from './Cite';
import formula from './Formula';
import inputRef from './InputRef';

const decorators = [
  unsupported,
  link,
  cite,
  formula, 
  inputRef
];

export function buildCompositeDecorator(props: Object) : CompositeDecorator {
  return new CompositeDecorator(decorators.map(build => build(props)));
}
