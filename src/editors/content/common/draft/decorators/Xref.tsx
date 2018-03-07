import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Xref as XrefData } from 'data/content/workbook/xref';
import { StyledInlineEntity } from './StyledInlineEntity';

class Xref extends React.PureComponent<any, any> {


  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const tooltip = 'Cross reference';

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
    strategy: byType.bind(undefined, EntityTypes.xref),
    component: Xref,
    props,
  };
}
