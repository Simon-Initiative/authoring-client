export type AcquiredLock = {
  courseId: string,
  documentId: string,
};

export type RegisterLocks = (locks: AcquiredLock[]) => void;
export type UnregisterLocks = (locks: AcquiredLock[]) => void;
