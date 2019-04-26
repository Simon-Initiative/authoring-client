import { Map } from 'immutable';
import { Maybe } from 'tsmonad';

export enum DatasetStatus {
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export type AnalyticsByResource = {
  resource: string,
  title: string,
  distinctStudents: number,
  distinctRegistrations: number,
  opportunities: number,
  practice: number,
  hints: number,
  errors: number,
  correct: number,
  firstResponseCorrect: number,
  utilizationStart: number,
  utilizationFinish: number,
  avgHelpNeeded: number,
  avgNumberOfTries: number,
  completionRate: number,
  accuracyRate: number,
};

export type AnalyticsBySkill = {
  skill: string,
  title: string,
  distinctStudents: number,
  distinctRegistrations: number,
  opportunities: number,
  practice: number,
  hints: number,
  errors: number,
  correct: number,
  firstResponseCorrect: number,
  avgHelpNeeded: number,
  avgNumberOfTries: number,
  completionRate: number,
  accuracyRate: number,
};

export type AnalyticsByPart = {
  id: string,
  resource: string,
  title: string,
  question: string,
  revision: string,
  part: string,
  submitAndCompare: boolean,
  distinctStudents: number,
  distinctRegistrations: number,
  practice: number,
  hints: number,
  errors: number,
  correct: number,
  firstResponseCorrect: number,
  avgHelpNeeded: number,
  avgNumberOfTries: number,
  completionRate: number,
  accuracyRate: number,
};

export type DataSet = {
  byResource: Maybe<Map<string, AnalyticsByResource>>,
  byResourcePart: Maybe<Map<string, Map<string, AnalyticsByPart>>>,
  bySkill: Maybe<Map<string, AnalyticsBySkill>>,
  status: DatasetStatus,
  dateCreated: string,
  dateCompleted: string,
};
