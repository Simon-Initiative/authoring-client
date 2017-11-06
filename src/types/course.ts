/** Global types related to course */
import { DocumentId } from 'data/types';

export type Title = {
  id: string,
  title: string,
};

export type Skill = {
  id: DocumentId,
  title: string,
};
