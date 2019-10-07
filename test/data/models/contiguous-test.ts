// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from 'data/contentTypes';
import { WorkbookPageModel } from 'data/models/workbook';
import { ContiguousText } from 'data/content/learning/contiguous';
import { registerContentTypes } from 'data/registrar';

function verifyString(contiguous: ContiguousText, str: string) {
  contiguous.extractPlainText().caseOf({
    just: v => expect(v).toBe(str),
    nothing: () => fail(),
  });
}

// A test to verify that contiguous text blocks are identified and
// grouped together.  The three p tags should be collapsed into a
// single ContiguousText, then a WbInline, then another ContiguousText
it('Contiguous text parsing', () => {

  registerContentTypes();

  const workbookPage = require('./simple.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();

  expect(body.length).toBe(3);

  expect(body[0] instanceof ContiguousText).toBe(true);
  expect(body[1] instanceof contentTypes.WbInline).toBe(true);
  expect(body[2] instanceof ContiguousText).toBe(true);

  verifyString(body[0] as ContiguousText, 'One');
  verifyString(body[2] as ContiguousText, 'Four');


});

