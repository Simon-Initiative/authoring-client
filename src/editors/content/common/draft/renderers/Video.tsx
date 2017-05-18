import * as React from 'react';
import { Video as VideoType } from '../../../../../data/content/html/video';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Select } from '../../Select';

import './markers.scss';

type Data = {
  video: VideoType;
};

export interface CodeBlockProps extends InteractiveRendererProps {
  data: Data;
}

export interface CodeBlockState extends InteractiveRendererState {
  
}

export interface CodeBlockProps {
  
}


class Video extends InteractiveRenderer<CodeBlockProps, CodeBlockState> {

  constructor(props) {
    super(props, {});

    this.onSourceEdit = this.onSourceEdit.bind(this);
    this.onSyntaxChange = this.onSyntaxChange.bind(this);
  }

  onSourceEdit(source) {
    // this.props.blockProps.onEdit({ video: this.props.data.video.with({ source }) });
  }

  onSyntaxChange(syntax) {
    // this.props.blockProps.onEdit({ video: this.props.data.video.with({ syntax }) });
  }

  render() : JSX.Element {

    return <span>Test</span>;
  }
}

export default Video;
