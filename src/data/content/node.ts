import { Question } from './question';
import { Content } from './content';
import { Selection } from './selection';
import { Unsupported } from './unsupported';

export type Node = 
  Question | 
  Content | 
  Selection |
  Unsupported;
