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
  Dd: flatui.orange,
  Dl: flatui.orange,
  Dt: flatui.orange,
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

export const getContentColor = (type: string) => CONTENT_COLORS[type] || colors.grayLight;

export enum insertableContentTypes {
  Activity, Alternative, Alternatives, Applet, Audio, BlockCode, BlockFormula, 
  BlockQuote, CellData, CellHeader, CodeBlock, Composite, Conjugate, Conjugation, 
  ContiguousText, Custom, Definition, Dd, Dl, Dt, Dialog, Director, Example, Figure, 
  Flash, Hint, IFrame, Image, Instructions, Li, Line, Materials, Math, Mathematica, Meaning, 
  Ol, Panopto, Param, Pronunciation, Pullout, Section, Speaker, Sym, Table, Translation, 
  Ul, Unity, Video, WbInline, YouTube,
}

const i = insertableContentTypes;

export const getContentIcon = (type: insertableContentTypes, style: React.CSSProperties) => {
  const st = style || null;

  switch (type) {
    case i.Activity: return <i style={st} className={'fa fa-check'} />;
    case i.Alternative: return <i style={st} className={'fa fa-plus-square-o'} />;
    case i.Alternatives: return <i style={st} className={'fa fa-plus-square'} />;
    case i.Applet: return <i style={st} className={'fa fa-coffee'} />;
    case i.Audio: return <i style={st} className={'fa fa-volume-up'} />;
    case i.BlockCode: return <i style={st} className={'fa fa-code'} />;
    case i.BlockFormula: return <i style={st} className="unicode-icon">∑</i>;
    case i.BlockQuote: return <i style={st} className={'fa fa-quote-right'} />;
    case i.CellData: return <i style={st} className={'fa fa-table'} />;
    case i.CellHeader: return <i style={st} className={'fa fa-table'} />;
    case i.CodeBlock: return <i style={st} className={'fa fa-code'} />;
    case i.Composite: return <i style={st} className={'fa fa-clone'} />;
    case i.Conjugate: return <i style={st} className={'fa fa-language'} />;
    case i.Conjugation: return <i style={st} className={'fa fa-language'} />;
    case i.ContiguousText: return <i style={st} className="unicode-icon">T</i>;
    case i.Custom: return <i style={st} className={'fa fa-keyboard-o'} />;
    case i.Definition: return <i style={st} className={'fa fa-book'} />;
    case i.Dd: return <i style={st} className={'fa fa-book'} />;
    case i.Dl: return <i style={st} className={'fa fa-book'} />;
    case i.Dt: return <i style={st} className={'fa fa-book'} />;
    case i.Dialog: return <i style={st} className={'fa fa-comments'} />;
    case i.Director: return <i style={st} className={'fa fa-compass'} />;
    case i.Example: return <i style={st} className={'fa fa-bar-chart'} />;
    case i.Figure: return <i style={st} className={'fa fa-address-card'} />;
    case i.Flash: return <i style={st} className={'fa fa-bolt'} />;
    case i.Hint: return <i style={st} className={'fa fa-hand-o-left'} />;
    case i.IFrame: return <i style={st} className={'fa fa-window-maximize'} />;
    case i.Image: return <i style={st} className={'fa fa-image'} />;
    case i.Instructions: return <i style={st} className={'fa fa-file-text'} />;
    case i.Li: return <i style={st} className={'fa fa-list'} />;
    case i.Line: return <i style={st} className={'fa fa-comments'} />;
    case i.Materials: return <i style={st} className={'fa fa-columns'} />;
    case i.Math: return <i style={st} className={'fa fa-etsy'} />;
    case i.Mathematica: return <i style={st} className="unicode-icon">∫</i>;
    case i.Meaning: return <i style={st} className={'fa fa-comment'} />;
    case i.Ol: return <i style={st} className={'fa fa-list-ol'} />;
    case i.Panopto: return <i style={st} className={'fa fa-video-camera'} />;
    case i.Param: return <i style={st} className={'fa fa-sticky-note-o'} />;
    case i.Pronunciation: return <i style={st} className={'fa fa-headphones'} />;
    case i.Pullout: return <i style={st} className={'fa fa-external-link-square'} />;
    case i.Section: return <i style={st} className={'fa fa-list-alt'} />;
    case i.Speaker: return <i style={st} className={'fa fa-comments'} />;
    case i.Sym: return <i style={st} className={'fa fa-sun-o'} />;
    case i.Table: return <i style={st} className={'fa fa-table'} />;
    case i.Translation: return <i style={st} className={'fa fa-globe'} />;
    case i.Ul: return <i style={st} className={'fa fa-list-ul'} />;
    case i.Unity: return <i style={st} className={'fa fa-gamepad'} />;
    case i.Video: return <i style={st} className={'fa fa-film'} />;
    case i.WbInline: return <i style={st} className={'fa fa-flask'} />;
    case i.YouTube: return <i style={st} className={'fa fa-youtube'} />;
    default: return <i style={st} className={'fa fa-question'} />;
  }
};
