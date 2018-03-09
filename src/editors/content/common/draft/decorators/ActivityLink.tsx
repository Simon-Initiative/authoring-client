import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { ActivityLink as ActivityLinkData } from 'data/content/learning/activity_link';
import { StyledInlineEntity } from './StyledInlineEntity';

import './styles.scss';

class ActivityLink extends React.PureComponent<any, any> {

  constructor(props) {
    super(props);
  }


  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const tooltip = (data as ActivityLinkData).purpose;

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
    strategy: byType.bind(undefined, EntityTypes.activity_link),
    component: ActivityLink,
    props,
  };
}
