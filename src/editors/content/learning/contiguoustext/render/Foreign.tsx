import * as React from 'react';
import { InlineDisplayProps } from './common';

const sepStyle: any = {
  fontSize: '70%',
  color: '#c00',
  backgroundColor: 'inherit',
  fontWeight: 'bold',
  verticalAlign: 'sub',
};

export const ForeignDisplay = ({ attrs, node, onClick }: InlineDisplayProps) => {
  const foreign = { text: '' }

  return (
    <span {...attrs} onClick={onClick}>
      {foreign.text}
    </span>
  );
};
