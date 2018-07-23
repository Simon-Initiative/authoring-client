// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { WorkbookPageModel } from 'data/models//workbook';
import { ContiguousText } from 'data/content/learning//contiguous';
import { registerContentTypes } from 'data/registrar';
import { convertToRaw } from 'draft-js';

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

// Within contiguous text range, verify that simple, non-overlapping
// markup is being parsed correctly.
it('Non-overlapping markup text parsing', () => {

  const workbookPage = require('./nonoverlap.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();

  expect(body.length).toBe(3);

  expect(body[0] instanceof ContiguousText).toBe(true);
  expect(body[1] instanceof contentTypes.WbInline).toBe(true);
  expect(body[2] instanceof ContiguousText).toBe(true);

  verifyString(body[0] as ContiguousText, '12345');
  verifyString(body[2] as ContiguousText, 'Four');

  const raw = convertToRaw((body[0] as ContiguousText).content);
  const styles = raw.blocks[0].inlineStyleRanges;

  expect(styles.length).toBe(4);
  expect(styles[0]).toEqual({ offset: 1, length: 1, style: 'ITALIC' });
  expect(styles[1]).toEqual({ offset: 3, length: 1, style: 'ITALIC' });
  expect(styles[2]).toEqual({ offset: 2, length: 1, style: 'SUBSCRIPT' });
  expect(styles[3]).toEqual({ offset: 3, length: 1, style: 'SUPERSCRIPT' });

});


// Now a more complex test of styles - here one style overlaps (in this case
// subsumes) several other styles.
it('overlapping markup text parsing', () => {

  const workbookPage = require('./overlap.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();

  expect(body.length).toBe(3);

  expect(body[0] instanceof ContiguousText).toBe(true);
  expect(body[1] instanceof contentTypes.WbInline).toBe(true);
  expect(body[2] instanceof ContiguousText).toBe(true);

  verifyString(body[0] as ContiguousText, '1234');
  verifyString(body[2] as ContiguousText, 'Four');

  const raw = convertToRaw((body[0] as ContiguousText).content);
  const styles = raw.blocks[0].inlineStyleRanges;

  expect(styles.length).toBe(4);

  expect(styles[0]).toEqual({ offset: 1, length: 1, style: 'SUBSCRIPT' });
  expect(styles[1]).toEqual({ offset: 1, length: 3, style: 'ITALIC' });
  expect(styles[2]).toEqual({ offset: 2, length: 1, style: 'SUPERSCRIPT' });
  expect(styles[3]).toEqual({ offset: 2, length: 1, style: 'BOLD' });

});

// Test the case where there is only contiguous text
it('only contiguous text', () => {

  const workbookPage = require('./only-contig.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();

  expect(body.length).toBe(1);

  expect(body[0] instanceof ContiguousText).toBe(true);

  verifyString(body[0] as ContiguousText, 'One');

  const raw = convertToRaw((body[0] as ContiguousText).content);
  const blocks = raw.blocks;

  expect(blocks[0].text).toBe('One');
  expect(blocks[1].text).toBe('Two');
  expect(blocks[2].text).toBe('Three');
  expect(blocks[3].text).toBe('Four');

});


// Test various inline entities, links, images, quotes
it('inline entities', () => {

  const workbookPage = require('./inline-entities.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();

  expect(body.length).toBe(1);

  expect(body[0] instanceof ContiguousText).toBe(true);

  verifyString(body[0] as ContiguousText, 'Here is a bold link');

  const raw = convertToRaw((body[0] as ContiguousText).content);
  const styles = raw.blocks[0].inlineStyleRanges;

  expect(styles[0]).toEqual({ offset: 8, length: 11, style: 'BOLD' });
  expect(raw.entityMap['0'].type).toBe('link');
  expect(raw.entityMap['0'].mutability).toBe('MUTABLE');
  expect(raw.entityMap['0'].data.href).toBe('http://www.google.com');


});
