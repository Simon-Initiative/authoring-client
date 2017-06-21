import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { CourseId, DocumentId } from '../types';

function lock(
  courseId: CourseId, id: DocumentId, 
  action: string, hasTextResult: boolean): Promise<Object> {
  
  const url = `${configuration.baseUrl}/${courseId}/locks?action=${action}&resourceId=${id}`;
  return authenticatedFetch({ url, hasTextResult });
}

export function releaseLock(courseId: CourseId, id: DocumentId): Promise<Object> {
  return lock(courseId, id, 'RELEASE', true);
}

export function statusLock(courseId: CourseId, id: DocumentId): Promise<Object> {
  return lock(courseId, id, 'STATUS', true);
}

export function acquireLock(courseId: CourseId, id: DocumentId): Promise<Object> {
  return lock(courseId, id, 'AQUIRE', false);
}

