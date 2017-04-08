import { CompositeDecorator } from 'draft-js';

import unsupported from './Unsupported';
import link from './Link';
import cite from './Cite';

const decorators = [
  unsupported,
  link,
  cite
];

export default new CompositeDecorator(decorators); 
