import { Map } from 'immutable';
import * as models from 'data/models';
import { LearningObjective, Skill } from 'data/contentTypes';

export type AppContext = {
  userId: string;
  courseId: string;
  documentId: string;
  orgId: string;
  baseUrl: string;
  resourcePath: string;
  courseModel: models.CourseModel;
  undoRedoGuid: string;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
};
