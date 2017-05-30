import * as React from 'react';
import { YouTube as YouTubeType } from '../../../../../data/content/html/youtube';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { YouTubeEditor } from '../../../media/YouTubeEditor';

import './markers.scss';

type Data = {
  youtube: YouTubeType;
};

export interface YouTubeProps extends InteractiveRendererProps {
  data: Data;
}

export interface YouTubeState extends InteractiveRendererState {
  
}

export interface YouTubeProps {
  
}


class YouTube extends InteractiveRenderer<YouTubeProps, YouTubeState> {

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

        model={this.props.data.youtube}
        onCancel={() => this.props.blockProps.services.dismissModal()} 
        onInsert={(youtube) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ youtube });
        }
      }>
        <YouTubeEditor 
          model={this.props.data.youtube}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {

    const { src, height, width } = this.props.data.youtube;
    const fullSrc = 'https://www.youtube.com/embed/' 
      + (src === '' ? 'C0DPdy98e4c' : src);

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <div>
          <iframe src={fullSrc} height={height} width={width}/>
        </div>
        <Button editMode={this.state.editMode} onClick={this.onClick}>Edit</Button>
      </div>);
  }
}

export default YouTube;
