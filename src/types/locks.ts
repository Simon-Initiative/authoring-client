import { CourseIdVers } from 'data/types';
export type AcquiredLock = {
  courseId: CourseIdVers,
  documentId: string,
};

export type RegisterLocks = (locks: AcquiredLock[]) => void;
export type UnregisterLocks = (locks: AcquiredLock[]) => void;
