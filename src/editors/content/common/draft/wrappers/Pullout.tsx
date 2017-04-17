import * as React from 'react';
import { ContentWrapper, isEntityType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import { buildDivWrapper } from './builder';

import './Pullout.scss';

export const Pullout : ContentWrapper = {
  
  isBeginBlock: isEntityType.bind(undefined, EntityTypes.pullout_begin),
  isEndBlock: isEntityType.bind(undefined, EntityTypes.pullout_end),
  component: buildDivWrapper('pulloutWrapper')
};
