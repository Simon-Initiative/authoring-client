import { CourseIdVers, DocumentId } from 'data/types';

export type AcquiredLock = {
  courseId: CourseIdVers,
  documentId: DocumentId,
};

export type RegisterLocks = (locks: AcquiredLock[]) => void;
export type UnregisterLocks = (locks: AcquiredLock[]) => void;
