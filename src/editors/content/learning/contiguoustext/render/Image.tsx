import * as React from 'react';
import { InlineDisplayProps } from './common';

const IMAGE = require('../../../../../../assets/400x300.png');
import { buildUrl } from '../../../../../utils/path';

export const ImageDisplay = (props: InlineDisplayProps) => {
  const { attrs, node, onClick, context } = props;

  const img = node.data.get('value');
  const { src, height, width } = img;

  let fullSrc;
  if (src === undefined || src === null || src === '') {
    fullSrc = IMAGE;
  } else {
    fullSrc = buildUrl(
      context.baseUrl,
      context.courseModel.guid,
      context.resourcePath,
      src);
  }
  return <img
    {...attrs}
    onClick={onClick}
    src={fullSrc}
    height={height}
    width={width} />;
};
