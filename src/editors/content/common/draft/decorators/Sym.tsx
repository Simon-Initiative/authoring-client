import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { ContentState } from 'draft-js';
import { Sym as SymData } from 'data/content/learning/sym';
import { AppServices } from '../../../../common/AppServices';

const LARR_ICON = require('../../../../../../assets/lArr.png');
const LRARR_ICON = require('../../../../../../assets/lrarr.png');
const LRHAR_ICON = require('../../../../../../assets/lrhar.png');
const NOT_INDEP_ICON = require('../../../../../../assets/not_indep.gif');
const RARR_ICON = require('../../../../../../assets/rArr.png');
const RLARR_ICON = require('../../../../../../assets/rlarr.png');
const VBAR_ICON = require('../../../../../../assets/Vbar.png');

interface Sym {
  _onClick: any;
}

interface SymProps {

  services: AppServices;
  offsetKey: string;
  contentState: ContentState;
  entityKey: string;
  onEdit: (c: ContentState) => void;
  onDecoratorClick: (offsetKey) => void;
}

const sepStyle : any = {
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
  rlarr: () => <span className="sym"><img src={LARR_ICON} /></span>,
  Vbar: () => <span className="sym"><img src={LARR_ICON} /></span>,
  oslash: () => <span className="sym">&empty;</span>,
  not_indep: () => <span className="sym"><img height="11" width="18"
    src={NOT_INDEP_ICON} /></span>,
  set_by_interv: () => <span className="sym"><span style={sepStyle}><sub>sep</sub></span></span>,
};

class Sym extends React.Component<SymProps, any> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    const data : SymData
      = this.props.contentState.getEntity(this.props.entityKey).getData();

    return (
      <span data-offset-key={this.props.offsetKey}
        onClick={(e) => {
          e.stopPropagation();
          this.props.onDecoratorClick(this.props.entityKey);
        }}>
        {symbols[data.name]()}
      </span>
    );
  }
}


export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.sym),
    component: Sym,
    props,
  };
}
