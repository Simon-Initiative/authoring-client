
import { PersistenceStrategy } from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';

export const EditorRegistry = {};

export type RegisteredEditor = {
  name: string;
  component: Object;
  persistenceStrategy: PersistenceStrategy;
  listeningApproach: ListeningApproach;
  protected: boolean;
}

export function register(registration: RegisteredEditor) {
    EditorRegistry[registration.name] = registration
}

export function lookUpByName(name: string) : RegisteredEditor {
    console.log ("lookUpByName ("+name+")");  
    return EditorRegistry[name];
}





