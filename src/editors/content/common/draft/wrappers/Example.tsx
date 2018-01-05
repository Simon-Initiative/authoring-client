import { ContentWrapper, isEntityType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import { buildDivWrapper } from './builder';

import './Pullout.scss';

export const Example : ContentWrapper = {
  isBeginBlock: isEntityType.bind(undefined, EntityTypes.example_begin),
  isEndBlock: isEntityType.bind(undefined, EntityTypes.example_end),
  component: buildDivWrapper('pulloutWrapper'),
};
