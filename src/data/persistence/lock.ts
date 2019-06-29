import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import { DocumentId } from '../types';
import { CourseIdVers, CourseGuid } from 'data/types';

function lock(
  course: CourseGuid | CourseIdVers, id: DocumentId,
  action: string, hasTextResult: boolean): Promise<Object> {

  // tslint:disable-next-line:max-line-length
  const url = `${configuration.baseUrl}/${course.value()}/locks?action=${action}&resourceId=${id}`;
  return authenticatedFetch({ url, hasTextResult });
}

export function releaseLock(course: CourseGuid | CourseIdVers, id: DocumentId): Promise<Object> {
  return lock(course, id, 'RELEASE', true);
}

export function statusLock(course: CourseGuid | CourseIdVers, id: DocumentId): Promise<Object> {
  return lock(course, id, 'STATUS', true);
}

export function acquireLock(course: CourseGuid | CourseIdVers, id: DocumentId): Promise<Object> {
  return lock(course, id, 'AQUIRE', false);
}

