import * as React from 'react';
import colors from 'styles/colors';
import distinct from 'styles/palettes/distinct';
import flatui from 'styles/palettes/flatui';

export const CONTENT_COLORS = {
  ContiguousText: flatui.orange,
  CodeBlock: flatui.wetAsphalt,
  Quote: distinct.distinctLavender,
  Math: distinct.distinctLime,
  Cite: distinct.distinctMagenta,
  Xref: distinct.distinctMaroon,
  Example: flatui.turquoise,
  Pullout: distinct.distinctNavy,
  Section: distinct.distinctBlue,
  Image: flatui.sunflower,
  Activity: distinct.distinctGreen,
  WbInline: flatui.amethyst,
  YouTube: colors.youtubeRed,
  Audio: flatui.pumpkin,
  Video: flatui.midnightBlue,
  IFrame: flatui.carrot,
  Ul: distinct.distinctOlive,
  Ol: distinct.distinctOlive,
  Li: distinct.distinctMint,
};

export const CONTENT_ICONS = {
  ContiguousText: <i className="unicode-icon">T</i>,
  CodeBlock: <i className={'fa fa-code'}/>,
  Example: <i className={'fa fa-bar-chart'}/>,
  Pullout: <i className={'fa fa-external-link-square'}/>,
  Section: <i className={'fa fa-list-alt'}/>,
  YouTube: <i className={'fa fa-youtube'}/>,
  Image: <i className={'fa fa-image'}/>,
  Audio: <i className={'fa fa-volume-up'}/>,
  WbInline: <i className={'fa fa-flask'}/>,
  Activity: <i className={'fa fa-check'}/>,
  Video: <i className={'fa fa-film'}/>,
  IFrame: <i className={'fa fa-window-maximize'}/>,
  Ul: <i className={'fa fa-list-ul'}/>,
  Ol: <i className={'fa fa-list-ol'}/>,
  Li: <i className={'fa fa-list'}/>,
};

export const getContentColor = (type: string) => CONTENT_COLORS[type] || colors.grayLight;

export const getContentIcon = (type: string) => CONTENT_ICONS[type]
  || <i className={'fa fa-question'}/>;
