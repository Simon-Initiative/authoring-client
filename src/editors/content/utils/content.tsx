import * as React from 'react';
import colors from 'styles/colors';
import distinct from 'styles/palettes/distinct';

export const CONTENT_COLORS = {
  ContiguousText: distinct.distinctOrange,
  CodeBlock: distinct.distinctGrey,
  Link: distinct.distinctCyan,
  ActivityLink: distinct.distinctGreen,
  Quote: distinct.distinctLavender,
  Math: distinct.distinctLime,
  Cite: distinct.distinctMagenta,
  Xref: distinct.distinctMaroon,
  Example: distinct.distinctMint,
  Pullout: distinct.distinctNavy,
  Section: distinct.distinctBlue,
  Image: distinct.distinctRed,
};

export const CONTENT_ICONS = {
  ContiguousText: <i className="unicode-icon">T</i>,
  CodeBlock: <i className={'fa fa-code'}/>,
  Example: <i className={'fa fa-bar-chart'}/>,
  Pullout: <i className={'fa fa-external-link-square'}/>,
  Section: <i className={'fa fa-list-alt'}/>,
  Image: <i className={'fa fa-image'}/>,
};

export const getContentColor = (type: string) => CONTENT_COLORS[type] || colors.grayLight;

export const getContentIcon = (type: string) => CONTENT_ICONS[type]
  || <i className={'fa fa-question'}/>;
