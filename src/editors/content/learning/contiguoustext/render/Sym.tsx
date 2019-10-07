import * as React from 'react';
import { InlineDisplayProps } from './common';

const LARR_ICON = require('../../../../../../assets/lArr.png');
const LRARR_ICON = require('../../../../../../assets/lrarr.png');
const LRHAR_ICON = require('../../../../../../assets/lrhar.png');
const NOT_INDEP_ICON = require('../../../../../../assets/not_indep.gif');
const RARR_ICON = require('../../../../../../assets/rArr.png');
const RLARR_ICON = require('../../../../../../assets/rlarr.png');
const VBAR_ICON = require('../../../../../../assets/Vbar.png');

const sepStyle: any = {
  fontSize: '70%',
  color: '#c00',
  backgroundColor: 'inherit',
  fontWeight: 'bold',
  verticalAlign: 'sub',
};

const symbols = {
  amp: () => <span className="sym">&amp;</span>,
  mdash: () => <span className="sym">&mdash;</span>,
  equals: () => <span className="sym">&#61;</span>,
  ne: () => <span className="sym">&ne;</span>,
  lt: () => <span className="sym">&lt;</span>,
  le: () => <span className="sym">&le;</span>,
  gt: () => <span className="sym">&gt;</span>,
  ge: () => <span className="sym">&ge;</span>,
  larr: () => <span className="sym">&larr;</span>,
  lArr: () => <span className="sym"><img src={LARR_ICON} /></span>,
  lrarr: () => <span className="sym"><img src={LRARR_ICON} /></span>,
  lrhar: () => <span className="sym"><img src={LRHAR_ICON} /></span>,
  rarr: () => <span className="sym">&rarr;</span>,
  rArr: () => <span className="sym"><img src={RARR_ICON} /></span>,
  rlarr: () => <span className="sym"><img src={RLARR_ICON} /></span>,
  Vbar: () => <span className="sym"><img src={VBAR_ICON} /></span>,
  oslash: () => <span className="sym">&empty;</span>,
  not_indep: () => <span className="sym"><img height="11" width="18"
    src={NOT_INDEP_ICON} /></span>,
  set_by_interv: () => <span className="sym"><span style={sepStyle}>
    <sub>sep</sub></span></span>,
};

export const SymDisplay = (props: InlineDisplayProps) => {
  const { attrs, node, onClick } = props;
  const sym = node.data.get('value');

  return (
    <span {...attrs} onClick={onClick}>
      {symbols[sym.name]()}
    </span>
  );
};
