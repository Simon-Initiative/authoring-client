// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from 'data/contentTypes';
import { WorkbookPageModel } from 'data/models/workbook';
import { PoolModel } from 'data/models/pool';

import { registerContentTypes } from 'data/registrar';
import { ContiguousText } from 'data/content/learning/contiguous';

it('Single, top-level section', () => {

  registerContentTypes();

  const workbookPage = require('./single-section.json');
  const model = WorkbookPageModel.fromPersistence(workbookPage, () => null);

  const body = model.body.content.toArray();

  expect(body.length).toBe(1);
  expect(body[0] instanceof contentTypes.WorkbookSection).toBe(true);

  const section: contentTypes.WorkbookSection = ((body[0] as any) as contentTypes.WorkbookSection);

  const sectionBodyElements = section.body.content.toArray();

  expect(sectionBodyElements.length).toBe(5);

  const p = sectionBodyElements[0];

  if (p.contentType === 'Pullout') {
    const pullout = (p as any) as contentTypes.Pullout;

    expect(pullout.content.content.toArray().length).toBe(1);
    expect(pullout.content.content.first() instanceof ContiguousText).toBe(true);
  } else {
    fail('Should have been a pullout element, was: ' + p.contentType);
  }


});


it('handles pools with sections', () => {

  const pool = require('./pool-with-sections.json');
  const model = PoolModel.fromPersistence(pool, () => null);

  const questions = model.pool.questions;

  expect(questions.size).toBe(16);

});
