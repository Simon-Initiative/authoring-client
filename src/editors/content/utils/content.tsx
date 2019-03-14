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
  Answer: flatui.wetAsphalt,
  Bibliography: flatui.turquoise,
  BlockCode: flatui.concrete,
  BlockFormula: colors.pink,
  BlockQuote: distinct.distinctLavender,
  CellData: flatui.pomegranite,
  CellHeader: flatui.pomegranite,
  Cite: distinct.distinctMagenta,
  CodeBlock: flatui.wetAsphalt,
  Command: flatui.belizeHole,
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
  Entry: distinct.distinctGreen,
  Article: distinct.distinctGreen,
  Book: distinct.distinctGreen,
  Booklet: distinct.distinctGreen,
  Conference: distinct.distinctGreen,
  InBook: distinct.distinctGreen,
  InCollection: distinct.distinctGreen,
  InProceedings: distinct.distinctGreen,
  Manual: distinct.distinctGreen,
  MastersThesis: distinct.distinctGreen,
  PhdThesis: distinct.distinctGreen,
  Proceedings: distinct.distinctGreen,
  TechReport: distinct.distinctGreen,
  Unpublished: distinct.distinctGreen,
  Misc: distinct.distinctGreen,
  Example: flatui.turquoise,
  Feedback: flatui.greenSea,
  FeedbackChoice: flatui.amethyst,
  Figure: flatui.greenSea,
  Flash: flatui.greenSea,
  Hint: flatui.alizarin,
  IFrame: flatui.carrot,
  Image: flatui.sunflower,
  Inquiry: colors.primary,
  InquiryQuestion: distinct.distinctMaroon,
  Instructions: flatui.emerald,
  Li: distinct.distinctMint,
  Line: distinct.distinctTeal,
  Materials: distinct.distinctBrown,
  Math: distinct.distinctLime,
  Mathematica: flatui.greenSea,
  Meaning: flatui.asbestos,
  Multipanel: flatui.belizeHole,
  Ol: distinct.distinctOlive,
  Panopto: flatui.greenSea,
  Param: flatui.silver,
  Pronunciation: flatui.alizarin,
  Proof: flatui.peterRiver,
  Pullout: distinct.distinctNavy,
  Section: distinct.distinctBlue,
  Speaker: distinct.distinctTeal,
  Statement: distinct.distinctNavy,
  Sym: colors.warning,
  Table: flatui.pomegranite,
  Theorem: distinct.distinctBrown,
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
  Activity, Alternative, Alternatives, Answer, Applet, Audio, BlockCode, BlockFormula,
  BlockQuote, CellData, CellHeader, CodeBlock, Command, Composite, Conjugate, Conjugation,
  ContiguousText, Custom, Definition, Dd, Dl, Dt, Dialog, Director, Example, Feedback,
  FeedbackChoice, Figure, Flash, Hint, IFrame, Image, Inquiry, InquiryQuestion, Instructions,
  Li, Line, Materials, Math, Mathematica, Meaning, Multipanel,
  Ol, Panopto, Param, Pronunciation, Proof, Pullout,
  Section, Speaker, Statement, Sym, Table, Theorem, Translation,
  Ul, Unity, Video, WbInline, YouTube,
  Bibliography, Entry,
  Article, Book, Booklet, Conference, InBook, InCollection, InProceedings, Manual,
  MastersThesis, PhdThesis, Proceedings, TechReport, Unpublished, Misc,
}

const i = insertableContentTypes;

export const getContentIcon = (type: insertableContentTypes, style?: React.CSSProperties) => {
  switch (type) {
    case i.Activity: return <i style={style} className={'fa fa-check'} />;
    case i.Alternative: return <i style={style} className={'far fa-plus-square'} />;
    case i.Alternatives: return <i style={style} className={'fa fa-plus-square'} />;
    case i.Answer: return <i style={style} className={'fa fa-exclamation'} />;
    case i.Applet: return <i style={style} className={'fa fa-coffee'} />;
    case i.Audio: return <i style={style} className={'fa fa-volume-up'} />;
    case i.Bibliography: return <i style={style} className={'fa fa-bookmark'} />;
    case i.BlockCode: return <i style={style} className={'fa fa-code'} />;
    case i.BlockFormula: return <i style={style} className="unicode-icon">∑</i>;
    case i.BlockQuote: return <i style={style} className={'fa fa-quote-right'} />;
    case i.CellData: return <i style={style} className={'fa fa-table'} />;
    case i.CellHeader: return <i style={style} className={'fa fa-table'} />;
    case i.CodeBlock: return <i style={style} className={'fa fa-code'} />;
    case i.Command: return <i style={style} className={'far fa-caret-square-right'} />;
    case i.Composite: return <i style={style} className={'fa fa-clone'} />;
    case i.Conjugate: return <i style={style} className={'fa fa-language'} />;
    case i.Conjugation: return <i style={style} className={'fa fa-language'} />;
    case i.ContiguousText: return <i style={style} className="unicode-icon">T</i>;
    case i.Custom: return <i style={style} className={'far fa-keyboard'} />;
    case i.Dd: return <i style={style} className={'fa fa-book'} />;
    case i.Dl: return <i style={style} className={'fa fa-book'} />;
    case i.Dt: return <i style={style} className={'fa fa-book'} />;
    case i.Dialog: return <i style={style} className={'fa fa-comments'} />;
    case i.Director: return <i style={style} className={'fa fa-compass'} />;
    case i.Entry: return <i style={style} className={'far fa-bookmark'} />;
    case i.Article: return <i style={style} className={'far fa-bookmark'} />;
    case i.Book: return <i style={style} className={'far fa-bookmark'} />;
    case i.InBook: return <i style={style} className={'far fa-bookmark'} />;
    case i.InProceedings: return <i style={style} className={'far fa-bookmark'} />;
    case i.Booklet: return <i style={style} className={'far fa-bookmark'} />;
    case i.Conference: return <i style={style} className={'far fa-bookmark'} />;
    case i.InCollection: return <i style={style} className={'far fa-bookmark'} />;
    case i.Manual: return <i style={style} className={'far fa-bookmark'} />;
    case i.MastersThesis: return <i style={style} className={'far fa-bookmark'} />;
    case i.PhdThesis: return <i style={style} className={'far fa-bookmark'} />;
    case i.Proceedings: return <i style={style} className={'far fa-bookmark'} />;
    case i.TechReport: return <i style={style} className={'far fa-bookmark'} />;
    case i.Unpublished: return <i style={style} className={'far fa-bookmark'} />;
    case i.Misc: return <i style={style} className={'far fa-bookmark'} />;
    case i.Example: return <i style={style} className={'far fa-chart-bar'} />;
    case i.Feedback: return <i style={style} className={'fa fa-clipboard'} />;
    case i.FeedbackChoice: return <i style={style} className={'fa fa-circle-o'} />;
    case i.Figure: return <i style={style} className={'fa fa-address-card'} />;
    case i.Flash: return <i style={style} className={'fa fa-bolt'} />;
    case i.Hint: return <i style={style} className={'far fa-hand-point-right'} />;
    case i.IFrame: return <i style={style} className={'far fa-window-maximize'} />;
    case i.Inquiry: return <i style={style} className={'fas fa-comment-alt'} />;
    case i.InquiryQuestion: return <i style={style} className={'fa fa-question'} />;
    case i.Image: return <i style={style} className={'fa fa-image'} />;
    case i.Instructions: return <i style={style} className={'fas fa-file-alt'} />;
    case i.Li: return <i style={style} className={'fa fa-list'} />;
    case i.Line: return <i style={style} className={'fa fa-comments'} />;
    case i.Materials: return <i style={style} className={'fa fa-columns'} />;
    case i.Math: return <i style={style} className={'fab fa-etsy'} />;
    case i.Mathematica: return <i style={style} className="unicode-icon">∫</i>;
    case i.Meaning: return <i style={style} className={'fa fa-comment'} />;
    case i.Multipanel: return <i style={style} className={'fa fa-object-ungroup'} />;
    case i.Ol: return <i style={style} className={'fa fa-list-ol'} />;
    case i.Panopto: return <i style={style} className={'fas fa-video'} />;
    case i.Param: return <i style={style} className={'far fa-sticky-note'} />;
    case i.Pronunciation: return <i style={style} className={'fa fa-headphones'} />;
    case i.Proof: return <i style={style} className={'fa fa-sticky-note'} />;
    case i.Pullout: return <i style={style} className={'fas fa-external-link-square-alt'} />;
    case i.Section: return <i style={style} className={'fas fa-list-alt'} />;
    case i.Speaker: return <i style={style} className={'fa fa-comments'} />;
    case i.Statement: return <i style={style} className={'fa fa-edit'} />;
    case i.Sym: return <i style={style} className={'far fa-sun'} />;
    case i.Table: return <i style={style} className={'fa fa-table'} />;
    case i.Theorem: return <i style={style} className={'fa fa-university'} />;
    case i.Translation: return <i style={style} className={'fa fa-globe'} />;
    case i.Ul: return <i style={style} className={'fa fa-list-ul'} />;
    case i.Unity: return <i style={style} className={'fa fa-gamepad'} />;
    case i.Video: return <i style={style} className={'fa fa-film'} />;
    case i.WbInline: return <i style={style} className={'fa fa-flask'} />;
    case i.YouTube: return <i style={style} className={'fab fa-youtube'} />;
    default: return <i style={style} className={'fa fa-question'} />;
  }
};
