import * as React from 'react';
import { InlineDisplayProps } from './common';
import { Foreign } from 'data/content/learning/foreign';

const sepStyle: any = {
  fontSize: '70%',
  color: '#c00',
  backgroundColor: 'inherit',
  fontWeight: 'bold',
  verticalAlign: 'sub',
};

export const ForeignDisplay = ({ attrs, node, onClick }: InlineDisplayProps) => {
  const foreign: Foreign = node.data.get('value');

  console.log('foreign', foreign)

  return (
    <span {...attrs} onClick={onClick}>
      {foreign.text}
    </span>
  );
};
