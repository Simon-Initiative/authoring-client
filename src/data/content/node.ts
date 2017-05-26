import { Question } from './question';
import { Content } from './content';
import { Selection } from './selection';
import { Unsupported } from './Unsupported';

export type Node = 
  Question | 
  Content | 
  Selection |
  Unsupported;
