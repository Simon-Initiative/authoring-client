import * as React from 'react';
import { Video as VideoType } from 'data/content/learning/video';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import ModalMediaEditor from 'editors/content/media/ModalMediaEditor';
import { VideoEditor } from 'editors/content/media/VideoEditor';
import { buildUrl } from 'utils/path';
import AutoHideEditRemove from './AutoHideEditRemove';

import './markers.scss';

type Data = {
  video: VideoType;
};

export interface VideoProps extends InteractiveRendererProps {
  data: Data;
}

export interface VideoState extends InteractiveRendererState {

}

export interface VideoProps {

}


class Video extends InteractiveRenderer<VideoProps, VideoState> {

  constructor(props) {
    super(props, {});

    this.onClick = this.onClick.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onClick() {
    const b = this.props.blockProps;
    this.props.blockProps.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={b.context}
        services={b.services}

        model={this.props.data.video}
        onCancel={() => this.props.blockProps.services.dismissModal()}
        onInsert={(video) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ video });
        }
      }>
        <VideoEditor
          onFocus={null}
          model={this.props.data.video}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  onRemove() {
    this.props.blockProps.onRemove();
  }

  render() : JSX.Element {

    const { sources, controls } = this.props.data.video;

    let fullSrc = '';
    if (sources.size > 0) {
      const src = sources.first().src;
      fullSrc = buildUrl(
      this.props.blockProps.context.baseUrl,
      this.props.blockProps.context.courseId,
      this.props.blockProps.context.resourcePath,
      src);
    }

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <AutoHideEditRemove onEdit={this.onClick} onRemove={this.onRemove}
          editMode={this.props.blockProps.editMode} >
          <video src={fullSrc} controls={controls}/>
        </AutoHideEditRemove>
      </div>);
  }
}

export default Video;
