
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

export function resourceQuery(resources: string[]) : Object {
  return {
    selector: {
      '_id': {'$in': resources},
    },
    fields: ['_id', 'title', 'metadata']
  };
}