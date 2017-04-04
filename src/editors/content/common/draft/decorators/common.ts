import { ContentState, ContentBlock} from 'draft-js';

export type Decorator = {
  component : any,
  strategy : (contentBlock : ContentBlock, callback: any, contentState : ContentState) => void
};