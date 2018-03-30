import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { buildUrl } from '../../../../../utils/path';

const IMAGE = require('../../../../../../assets/400x300.png');

class Image extends React.PureComponent<any, any> {

  constructor(props) {
    super(props);

  }

  render() : JSX.Element {

    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const src = data.src;

    let fullSrc;
    if (src === undefined || src === null || src === '') {
      fullSrc = IMAGE;
    } else {
      fullSrc = buildUrl(
        this.props.context.baseUrl,
        this.props.context.courseId,
        this.props.context.resourcePath,
        src);
    }

    return (
      <span data-offset-key={this.props.offsetKey}>
        <img
          src={fullSrc}
          height={data.height}
          width={data.width}
          />
      </span>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.image),
    component: Image,
    props,
  };
}
