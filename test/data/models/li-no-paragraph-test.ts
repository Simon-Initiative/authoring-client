// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from 'data/contentTypes';
import { WorkbookPageModel } from 'data/models/workbook';
import { ContiguousText } from 'data/content/learning/contiguous';
import { registerContentTypes } from 'data/registrar';
import { ContentElements } from 'data/content/common/elements';

function verifyStringContains(contiguous: ContiguousText, str: string) {
  contiguous.extractPlainText().caseOf({
    just: v => expect(v).toContain(str),
    nothing: () => fail(),
  });
}

// Test for bug AUTHORING-2324: verify em-styled text in list item
// containing sublist is preserved when item content not wrapped in a paragraph
it('Parse styled list item content not in paragraph (AUTHORING-2324)', () => {

  registerContentTypes();

  const workbookPage = require('./li-no-paragraph.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();
  expect(body.length).toBe(1);
  expect(body[0] instanceof contentTypes.Ul).toBe(true);
  const ul = body[0] as contentTypes.Ul;

  // console.log(JSON.stringify(ul, (k,v) => k === 'supportedElements' ? undefined : v, 4));

  const listItems = ul.listItems.toArray();
  expect(listItems.length).toBe(1);
  expect(listItems[0] instanceof contentTypes.Li).toBe(true);
  const item = listItems[0] as contentTypes.Li;

  const itemContentElements  = item.content as ContentElements;
  const itemContents = itemContentElements.content.toArray();

  // Contents should consist of a ContiguousText followed by a nested UL
  expect(itemContents.length).toBe(2);
  expect(itemContents[0] instanceof ContiguousText).toBe(true);
  expect(itemContents[1] instanceof contentTypes.Ul).toBe(true);
  const itemText = itemContents[0] as ContiguousText;

  // cheap test for bug fix: make sure em-tagged text was not deleted from li's content
  verifyStringContains(itemText, 'Emphasized');
});

