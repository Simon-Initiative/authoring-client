// Unit tests to ensure the content types and model objects correctly
// serialize to JSON and can correctly deserialize back from JSON

import * as contentTypes from '../src/data/contentTypes';
import * as models from '../src/data/models';
import { ContentState } from 'draft-js';

const assessment = require('./assessment.json');
const workbook_page = require('./master-workbook.json');

it('WorkbookPageModel', () => {

  // A complete test of converting back and forth from
  // persistence to object model and back:
  let model = models.WorkbookPageModel.fromPersistence(workbook_page);
  let persisted = model.toPersistence();
  
  model = models.WorkbookPageModel.fromPersistence(persisted);
  
  // Now verify that all the pieces and parts are present:
  expect(model.head.title.text).toBe('This is the title');
  
});

it('AssessmentModel', () => {

  // A complete test of converting back and forth from
  // persistence to object model and back:
  let model = models.AssessmentModel.fromPersistence(assessment);
  let persisted = model.toPersistence();
  
  model = models.AssessmentModel.fromPersistence(persisted);
  
  // Now verify that all the pieces and parts are present:

  expect(model.title.text).toBe('Tutor');
  expect(model.nodes.size).toBe(3);

  const node : models.Node = model.nodes.toArray()[1];
  expect(node.contentType).toBe('Question');

  const question : contentTypes.Question = (node as contentTypes.Question);
  expect(question.id).toBe('multiple_choice');

  const blocks = question.body.contentState.getBlocksAsArray();
  expect(blocks.length).toBe(1);
  expect(blocks[0].getText()).toBe('This is a multiple choice question');

  const items = question.items.toArray();
  expect(items.length).toBe(1);
  expect(items[0].contentType).toBe('MultipleChoice');
  const mc = (items[0] as contentTypes.MultipleChoice);
  expect(mc.shuffle).toBe(true);
  expect(mc.choices.toArray()[0].value).toBe('correct');
  expect(mc.choices.toArray()[0].body.contentState.getBlocksAsArray()[0].getText()).toBe('This is the correct choice');
  expect(mc.choices.toArray()[1].value).toBe('incorrect');
  expect(mc.choices.toArray()[1].body.contentState.getBlocksAsArray()[0].getText()).toBe('This is an incorrect choice');
  expect(mc.choices.toArray()[2].value).toBe('incorrect2');
  expect(mc.choices.toArray()[2].body.contentState.getBlocksAsArray()[0].getText()).toBe('This is also an incorrect choice');
  
  const parts = question.parts.toArray();
  expect(parts.length).toBe(1);

  const part : contentTypes.Part = parts[0];
  const responses = part.responses.toArray();
  expect(responses.length).toBe(2);
  expect(responses[0].match).toBe('correct');
  expect(responses[0].score).toBe('10');
  expect(responses[0].feedback.toArray()[0].body.contentState.getBlocksAsArray()[0].getText()).toBe('This is feedback for a correct choice');
  
  expect(responses[1].match).toBe('*');
  expect(responses[1].score).toBe('0');
  expect(responses[1].feedback.toArray()[0].body.contentState.getBlocksAsArray()[0].getText()).toBe('This is feedback for an incorrect choice');
  
  const hints = part.hints.toArray();
  expect(hints.length).toBe(1);
  const hintBlocks = hints[0].body.contentState.getBlocksAsArray();
  expect(hintBlocks.length).toBe(1);
  expect(hintBlocks[0].getText()).toBe('This is a hint');

});


