
import { WorkbookPageModel, ModelTypes } from './models';
import * as contentTypes from './contentTypes';

export function initWorkbook(title: string) : WorkbookPageModel {
  return new WorkbookPageModel({
    title: new contentTypes.TitleContent({ text: title})
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

/**
 * A query to determine which courses a user has permission
 * to acess. 
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
    fields: ['_id', 'title', 'modelType']
  };
}