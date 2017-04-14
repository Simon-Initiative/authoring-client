import { CompositeDecorator } from 'draft-js';

import unsupported from './Unsupported';
import link from './Link';
import cite from './Cite';
import formula from './Formula';

const decorators = [
  unsupported,
  link,
  cite,
  formula
];

export function buildCompositeDecorator(props: Object) : CompositeDecorator {
  return new CompositeDecorator(decorators.map(build => build(props)));
}
