import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Cite as CiteData } from 'data/content/learning/cite';
import { StyledInlineEntity } from './StyledInlineEntity';

import './styles.scss';

class Cite extends React.PureComponent<any, any> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const tooltip = (data as CiteData).entry === '' ? 'Citation' : (data as CiteData).entry;

    return (
      <StyledInlineEntity
        offsetKey={this.props.offsetKey}
        className="entity-hyperlink"
        tooltip={tooltip}>
        {this.props.children}
      </StyledInlineEntity>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.cite),
    component: Cite,
    props,
  };
}
