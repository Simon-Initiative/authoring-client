import { CourseIdV } from 'data/types';
export type AcquiredLock = {
  courseId: CourseIdV,
  documentId: string,
};

export type RegisterLocks = (locks: AcquiredLock[]) => void;
export type UnregisterLocks = (locks: AcquiredLock[]) => void;
