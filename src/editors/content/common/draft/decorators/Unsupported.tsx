import * as React from 'react';
import { Decorator } from './common';
import { EntityTypes } from '../custom';

import './Unsupported.scss';

function strategy(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === EntityTypes.UNSUPPORTED
      );
    },
    callback
  );
}

const component = (props) => {
  const data = props.contentState.getEntity(props.entityKey).getData();
  return (
    <span className='UnsupportedEntity'>
      {props.children}
    </span>
  );
};

const decorator : Decorator = {
  strategy,
  component
};

export default decorator;