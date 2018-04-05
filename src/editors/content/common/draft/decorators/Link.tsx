import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Image } from '../../../../../data/content/learning/image';
import { Link as LinkData } from 'data/content/learning/link';
import { StyledInlineEntity } from './StyledInlineEntity';

import './styles.scss';

class Link extends React.PureComponent<any, any> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    let children;
    if (data.content instanceof Image) {

      const src = data.content.src;
      let fullSrc;
      if (src.startsWith('..')) {
        fullSrc = this.props.context.baseUrl
          + '/' + this.props.context.courseId
          + '/'
          + this.props.context.resourcePath
          + '/' + src;
      } else {
        fullSrc = src;
      }

      children =
        <img
          src={fullSrc}
          height={data.content.height}
          width={data.content.width}/>;

    } else {
      children = this.props.children;
    }

    const tooltip = (data as LinkData).href;

    return (
      <StyledInlineEntity
        offsetKey={this.props.offsetKey}
        className="entity-hyperlink"
        tooltip={tooltip}>
        {children}
      </StyledInlineEntity>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.link),
    component: Link,
    props,
  };
}
