
import { PersistenceStrategy } from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';

export const EditorRegistry = {};

export type RegisteredEditor = {
  name: string;
  component: Object;
  persistenceStrategy: PersistenceStrategy;
  listeningApproach: ListeningApproach;
}

export function register(registration: RegisteredEditor) {
  EditorRegistry[registration.name] = registration
}

export function lookUpByName(name: string) : RegisteredEditor {
  return EditorRegistry[name];
}





