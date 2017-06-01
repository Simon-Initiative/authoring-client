
import * as models from '../../data/models';

export type AppContext = {
  userId: string;
  courseId: string;
  documentId: string;
  baseUrl: string;
  courseModel: models.CourseModel;
};
