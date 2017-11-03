/** Global types related to course */
import { DocumentId } from 'app/data/types';

export type Title = {
  id: string,
  title: string,
};

export type Skill = {
  id: DocumentId,
  title: string,
};
