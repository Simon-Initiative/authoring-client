import * as React from 'react';
import { Image as ImageType } from 'data/content/learning/image';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import { buildUrl } from 'utils/path';
import AutoHideEditRemove from './AutoHideEditRemove';

import './markers.scss';

const IMAGE = require('../../../../../../assets/400x300.png');

type Data = {
  image: ImageType;
};

export interface ImageProps extends InteractiveRendererProps {
  data: Data;
}

export interface ImageState extends InteractiveRendererState {

}

export interface ImageProps {

}


class Image extends InteractiveRenderer<ImageProps, ImageState> {

  constructor(props) {
    super(props, {});

    this.onClick = this.onClick.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onRemove() {
    this.props.blockProps.onRemove();
  }

  onClick() {

  }

  render() : JSX.Element {

    const { src, height, width } = this.props.data.image;

    let imageComponent = null;

    if (src === '') {
      imageComponent = <img onClick={this.onClick}
        src={IMAGE} width="400" height="300"/>;

    } else {

      const fullSrc = buildUrl(
        this.props.blockProps.context.baseUrl,
        this.props.blockProps.context.courseId,
        this.props.blockProps.context.resourcePath,
        src);

      imageComponent =
        <img onClick={this.onClick} src={fullSrc} width={width} height={height}/>;
    }

    return (
      <div ref={c => this.focusComponent = c}
        onFocus={this.onFocus} onBlur={this.onBlur}>
        <AutoHideEditRemove
          editMode={this.props.blockProps.editMode}
          onEdit={this.onClick}
          onRemove={this.onRemove}
          >
          {imageComponent}
        </AutoHideEditRemove>
      </div>
    );

  }
}

export default Image;
