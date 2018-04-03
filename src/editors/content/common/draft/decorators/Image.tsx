import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { buildUrl } from '../../../../../utils/path';
import { ContentState } from 'draft-js';
import { AppServices } from '../../../../common/AppServices';
import { AppContext } from '../../../../common/AppContext';


const IMAGE = require('../../../../../../assets/400x300.png');


interface ImageProps {
  context: AppContext;
  services: AppServices;
  offsetKey: string;
  contentState: ContentState;
  entityKey: string;
  onEdit: (c: ContentState) => void;
  onDecoratorClick: (offsetKey) => void;
}


class Image extends React.PureComponent<ImageProps, any> {

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
          onClick={(e) => {
            e.stopPropagation();
            this.props.onDecoratorClick(this.props.entityKey);
          }}
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
