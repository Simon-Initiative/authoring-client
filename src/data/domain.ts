
import { PendingDocument } from './persistence';

export function initWorkbook(title: string) : PendingDocument {
  return {
    metadata: {
      type: 'workbook',
      lockedBy: ''
    },
    title,
    content: {
      blocks: [
        {
          text: (
            'Sample text'
          ),
          type: 'unstyled',
          entityRanges: [],
      }],
      entityMap: {
      }
    }
  }
}

export function titlesForCoursesQuery(courseIds: string[]) : Object {
  return {
    selector: {
      '_id': {'$in': courseIds},
      'metadata.type': {'$eq': 'course'}
    },
    fields: ['_id', 'content.title']
  }
}

/**
 * A query to determine which courses a user has permission
 * to acess. 
 */
export function coursesQuery(userId: string) : Object {
  return {
    selector: {
      'content.userId': {'$eq': userId},
      'metadata.type': {'$eq': 'coursePermission'}
    }
  }
}

export function resourceQuery(resources: string[]) : Object {
  return {
    selector: {
      '_id': {'$in': resources},
    },
    fields: ['_id', 'title', 'metadata']
  };
}