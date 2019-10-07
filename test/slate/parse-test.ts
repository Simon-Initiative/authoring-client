
import { toSlate } from 'data/content/learning/slate/toslate';
import { registerContentTypes } from 'data/registrar';

it('Contiguous text parsing', () => {

  registerContentTypes();

  const content = require('./simple.json');

  const value = toSlate(content.data, false, null);
  console.log(JSON.stringify(value.toJSON(), null, 2));



});

