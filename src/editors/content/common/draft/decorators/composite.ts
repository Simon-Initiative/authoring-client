import { CompositeDecorator } from 'draft-js';

import unsupported from './Unsupported';

const decorators = [
  unsupported
];

export default new CompositeDecorator(decorators); 
