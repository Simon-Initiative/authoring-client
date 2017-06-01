import * as React from 'react';
import { Audio as AudioType } from '../../../../../data/content/html/audio';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { AudioEditor } from '../../../media/AudioEditor';

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
          model={this.props.data.audio}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {

    console.log(this.props);

    const { sources, controls } = this.props.data.audio;

    let src = '';
    if (sources.size > 0) {
      src = this.props.blockProps.context.baseUrl 
        + '/' + this.props.blockProps.context.courseId
        + '/webcontents/' + sources.first().src;
    }
    
    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <div>
          <audio src={src} controls={controls}/>
        </div>
        <Button editMode={this.props.blockProps.editMode} onClick={this.onClick}>Edit</Button>
      </div>);
  }
}

export default Audio;
