import { List } from 'immutable';
import { Maybe } from 'tsmonad';
import { LegacyTypes } from 'data/types';
import { PathElement } from 'types/edge';
import { Part } from 'data/contentTypes';
import guid from 'utils/guid';
import { ContentElements } from 'data/content/common/elements';
import { QUESTION_BODY_ELEMENTS } from 'data/content/assessment/types';

export type SkillPathElement = PathElement & {
  title?: string,
  '@id'?: string,
  parts?: Object[],
  body?: {
    body: any,
  },
  label?: string;
};

export interface PoolInfo {
  questionCount?: number;
  count?: number;
  exhaustion?: string;
  strategy?: string;
}

export interface QuestionRef {
  key: string;
  id: string;
  title: Maybe<string>;
  type: string;
  assessmentType: LegacyTypes;
  assessmentId: string;
  poolInfo: Maybe<PoolInfo>;
  parts: () => List<Part>;
  body: () => ContentElements;
  label: string;
}

const getPoolQuestionCount = (pathItem: SkillPathElement) => {
  // base case: if this pathItem is a pool, return the questionCount
  switch (pathItem.name) {
    case 'pool':
      return Maybe.just({
        questionCount: pathItem['questionCount'],
      });
    default:
      break;
  }
  if (pathItem.parent) {
    return getPoolQuestionCount(pathItem.parent);
  }

  // no parent exists. this is the end of the path and a pool parent has not been found
  return Maybe.nothing();
};

const getParts = (pathItem: SkillPathElement) => pathItem.parts
  ? List<Part>(pathItem.parts.map(p => Part.fromPersistence(p, guid(), () => { })))
  : List<Part>();

const getBody = (pathItem: SkillPathElement) => pathItem['body'] && ContentElements.fromPersistence(
  pathItem['body'], guid(), QUESTION_BODY_ELEMENTS, null, () => { });

export const getQuestionRefFromPathInfo = (
  pathItem: SkillPathElement, assessmentType: LegacyTypes,
  assessmentId: string): Maybe<QuestionRef> => {
  // base case: if this pathItem is a question, return the QuestionRef
  switch (pathItem.name) {
    case 'essay':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'essay',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'short_answer':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'short_answer',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'fill_in_the_blank':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'fill_in_the_blank',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'image_hotspot':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'image_hotspot',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'multiple_choice':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'multiple_choice',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'numeric':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'numeric',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'ordering':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'ordering',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    case 'question':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'question',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
        parts: () => getParts(pathItem),
        body: () => getBody(pathItem),
        label: pathItem.label,
      });
    default:
      break;
  }

  // item is not a question, recurse on parent if it exists
  if (pathItem.parent) {
    return getQuestionRefFromPathInfo(pathItem.parent, assessmentType, assessmentId);
  }

  // no parent exists. this is the end of the path and a question has not been found
  return Maybe.nothing();
};

export const getReadableTitleFromType = (type: string) => {
  switch (type) {
    case 'essay':
      return 'Essay';
    case 'short_answer':
      return 'Short Answer';
    case 'fill_in_the_blank':
      return 'Fill in the Blank';
    case 'image_hotspot':
      return 'Image Hotspot';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'numeric':
      return 'Numeric';
    case 'ordering':
      return 'Ordering';
    case 'question':
    default:
      return 'Question';
  }
};
