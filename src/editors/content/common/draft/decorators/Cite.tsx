import * as React from 'react';
import * as Immutable from 'immutable';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Cite as CiteData } from 'data/content/learning/cite';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { StyledInlineEntity } from './StyledInlineEntity';

import './styles.scss';



class Cite extends React.Component<{ orderedIds, entityKey, offsetKey, contentState }, any> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    const entry = (data as CiteData).entry;

    let toDisplay = (
      <StyledInlineEntity
        offsetKey={this.props.offsetKey}
        className="entity-hyperlink"
        tooltip="Citation">
        {this.props.children}
      </StyledInlineEntity>
    );

    if (entry !== '') {

      let position = this.props.orderedIds !== undefined && this.props.orderedIds.has(entry)
        ? this.props.orderedIds.get(entry) + 1
        : '  ';
      if ((position + '').length === 1) {
        position = ' ' + position;
      }
      toDisplay = <span className="cite">{position}</span>;
    }

    return (
      <span data-offset-key={this.props.offsetKey}>{toDisplay}</span>
    );
  }
}


export default function (props: Object): Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.cite),
    component: Cite,
    props,
  };
}


