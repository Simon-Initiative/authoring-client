import { Question } from 'data/content/assessment/question';
import guid from 'utils/guid';
import { testScores } from './_questions-test';
const jsonImageHotspot = require('./questions-valid/image-hotspot.json');

// tslint:disable max-line-length
describe('image hotspot should be parsed correctly', () => {
  const question: Question = Question.fromPersistence(
    Question.fromPersistence(jsonImageHotspot, guid()).toPersistence(),
    guid());

  const items = question.items;

  const parts = question.parts;
  const part1 = parts.first();

  const responses = part1.responses;
  const explanation = question.explanation;

  it('has an item', () => {
    expect(items.size).toEqual(1);
    items.forEach(item => expect(item.contentType).toBe('ImageHotspot'));
  });

  it('has a part', () => {
    expect(parts.size).toEqual(1);
  });

  it('has an explanation', () => {
    expect(explanation).toBeTruthy();
  });

  it('has responses', () => {
    expect(responses.size).toBeTruthy();
  });

  testScores(responses);
});
