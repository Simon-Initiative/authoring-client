import * as React from 'react';
import { Audio as AudioType } from 'data/content/learning/audio';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import ModalMediaEditor from 'editors/content/media/ModalMediaEditor';
import { AudioEditor } from 'editors/content/media/AudioEditor';
import { buildUrl } from 'utils/path';
import AutoHideEditRemove from './AutoHideEditRemove';

import './markers.scss';

type Data = {
  audio: AudioType;
};

export interface AudioProps extends InteractiveRendererProps {
  data: Data;
}

export interface AudioState extends InteractiveRendererState {

}

export interface AudioProps {

}


class Audio extends InteractiveRenderer<AudioProps, AudioState> {

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

        model={this.props.data.audio}
        onCancel={() => this.props.blockProps.services.dismissModal()}
        onInsert={(audio) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ audio });
        }
      }>
        <AudioEditor
          onFocus={null}
          model={this.props.data.audio}
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

    const { sources, controls } = this.props.data.audio;

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
          <audio src={fullSrc} controls={controls}/>
        </AutoHideEditRemove>
      </div>);
  }
}

export default Audio;
