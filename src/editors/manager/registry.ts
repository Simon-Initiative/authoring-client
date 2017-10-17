
import { PersistenceStrategy } from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';

export const REGISTRY = {};

export type RegisteredEditor = {
  name: string;
  component: Object;
  persistenceStrategyFactory: () => PersistenceStrategy;
  listeningApproach: ListeningApproach;
  protected: boolean;
};

export function register(registration: RegisteredEditor) {
  REGISTRY[registration.name] = registration;
}

export function lookUpByName(name: string) : RegisteredEditor {
  return REGISTRY[name];
}





