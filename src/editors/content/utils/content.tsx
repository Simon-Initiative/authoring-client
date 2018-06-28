import * as React from 'react';
import colors from 'styles/colors';
import distinct from 'styles/palettes/distinct';
import flatui from 'styles/palettes/flatui';

export const CONTENT_COLORS = {
  Activity: flatui.amethyst,
  Alternative: flatui.pumpkin,
  Alternatives: flatui.sunflower,
  Applet: flatui.greenSea,
  Audio: flatui.pumpkin,
  BlockCode: flatui.concrete,
  BlockFormula: colors.pink,
  BlockQuote: distinct.distinctLavender,
  CellData: flatui.pomegranite,
  CellHeader: flatui.pomegranite,
  Cite: distinct.distinctMagenta,
  CodeBlock: flatui.wetAsphalt,
  Composite: flatui.belizeHole,
  Conjugate: flatui.midnightBlue,
  Conjugation: flatui.midnightBlue,
  ContiguousText: flatui.orange,
  Custom: colors.pureApple,
  Definition: flatui.orange,
  Dialog: distinct.distinctTeal,
  Director: flatui.greenSea,
  Example: flatui.turquoise,
  Figure: flatui.greenSea,
  Flash: flatui.greenSea,
  Hint: flatui.alizarin,
  IFrame: flatui.carrot,
  Image: flatui.sunflower,
  Instructions: flatui.emerald,
  Li: distinct.distinctMint,
  Line: distinct.distinctTeal,
  Materials: distinct.distinctBrown,
  Math: distinct.distinctLime,
  Mathematica: flatui.greenSea,
  Meaning: flatui.asbestos,
  Ol: distinct.distinctOlive,
  Panopto: flatui.greenSea,
  Param: flatui.silver,
  Pronunciation: flatui.alizarin,
  Pullout: distinct.distinctNavy,
  Section: distinct.distinctBlue,
  Speaker: distinct.distinctTeal,
  Sym: colors.warning,
  Table: flatui.pomegranite,
  Translation: flatui.amethyst,
  Ul: distinct.distinctOlive,
  Unity: flatui.greenSea,
  Video: flatui.midnightBlue,
  WbInline: distinct.distinctGreen,
  Xref: distinct.distinctMaroon,
  YouTube: colors.youtubeRed,
};

export const CONTENT_ICONS = {
  Activity: <i className={'fa fa-flask'} />,
  Alternative: <i className={'fa fa-cog'} />,
  Alternatives: <i className={'fa fa-cogs'} />,
  Applet: <i className={'fa fa-coffee'} />,
  Audio: <i className={'fa fa-volume-up'} />,
  BlockCode: <i className={'fa fa-code'} />,
  BlockFormula: <i className="unicode-icon">∑</i>,
  BlockQuote: <i className={'fa fa-quote-right'} />,
  CellData: <i className={'fa fa-table'} />,
  CellHeader: <i className={'fa fa-table'} />,
  CodeBlock: <i className={'fa fa-code'} />,
  Composite: <i className={'fa fa-clone'} />,
  Conjugate: <i className={'fa fa-language'} />,
  Conjugation: <i className={'fa fa-language'} />,
  ContiguousText: <i className="unicode-icon">T</i>,
  Custom: <i className={'fa fa-keyboard-o'} />,
  Definition: <i className={'fa fa-book'} />,
  Dialog: <i className={'fa fa-comments'} />,
  Director: <i className={'fa fa-compass'} />,
  Example: <i className={'fa fa-bar-chart'} />,
  Figure: <i className={'fa fa-address-card'} />,
  Flash: <i className={'fa fa-bolt'} />,
  Hint: <i className={'fa fa-hand-o-left'} />,
  IFrame: <i className={'fa fa-window-maximize'} />,
  Image: <i className={'fa fa-image'} />,
  Instructions: <i className={'fa fa-file-text'} />,
  Li: <i className={'fa fa-list'} />,
  Line: <i className={'fa fa-comments'} />,
  Materials: <i className={'fa fa-columns'} />,
  Mathematica: <i className="unicode-icon">∫</i>,
  Meaning: <i className={'fa fa-comment'} />,
  Ol: <i className={'fa fa-list-ol'} />,
  Panopto: <i className={'fa fa-video-camera'} />,
  Param: <i className={'fa fa-sticky-note-o'} />,
  Pronunciation: <i className={'fa fa-headphones'} />,
  Pullout: <i className={'fa fa-external-link-square'} />,
  Section: <i className={'fa fa-list-alt'} />,
  Speaker: <i className={'fa fa-comments'} />,
  Sym: <i className={'fa fa-sun-o'} />,
  Table: <i className={'fa fa-table'} />,
  Translation: <i className={'fa fa-globe'} />,
  Ul: <i className={'fa fa-list-ul'} />,
  Unity: <i className={'fa fa-gamepad'} />,
  Video: <i className={'fa fa-film'} />,
  WbInline: <i className={'fa fa-check'} />,
  YouTube: <i className={'fa fa-youtube'} />,
};

export const getContentColor = (type: string) => CONTENT_COLORS[type] || colors.grayLight;

export const getContentIcon = (type: string) => CONTENT_ICONS[type]
  || <i className={'fa fa-question'} />;
