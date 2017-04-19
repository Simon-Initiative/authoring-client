
import { WorkbookPageModel, ModelTypes } from './models';
import * as contentTypes from './contentTypes';
import * as models from './models';

export function initWorkbook(titleText: string) : WorkbookPageModel {
  const title = new contentTypes.Title({ text: titleText});
  return new WorkbookPageModel({
    head: new contentTypes.Head({ title })
  });
}

export function titlesForCoursesQuery(courseIds: string[]) : Object {
  return {
    selector: {
      '_id': {'$in': courseIds},
      'modelType': {'$eq': 'CourseModel'}
    },
    fields: ['_id', 'title']
  }
}

export function titlesForCoursesResources(courseId: string) : Object {
  return {
    selector: {
      'courseId': {'$eq': courseId},
      'modelType': {'$in': ['WorkbookPageModel', 'AssessmentModel']}
    }
  }
}

export function titlesForEmbeddedResources(courseId: string) : Object {
  return {
    selector: {
      'courseId': {'$eq': courseId},
      'modelType': {'$in': ['AssessmentModel']}
    },
    fields: ['_id', 'head', 'modelType']
  }
}

/**
 * A query to determine which courses a user has permission
 * to access. 
 */
export function coursesQuery(userId: string) : Object {
  return {
    selector: {
      'userId': {'$eq': userId},
      'modelType': {'$eq': 'CoursePermissionModel'}
    }
  }
}

export function resourceQuery(resources: string[]) : Object {
  return {
    selector: {
      '_id': {'$in': resources},
    },
    fields: ['_id', 'head', 'modelType']
  };
}