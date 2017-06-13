import * as React from 'react';
import { IFrame as IFrameType } from '../../../../../data/content/html/iframe';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { IFrameEditor } from '../../../media/IFrameEditor';
import { buildUrl } from '../../../../../utils/path';

import './markers.scss';

type Data = {
  iframe: IFrameType;
};

export interface IFrameProps extends InteractiveRendererProps {
  data: Data;
}

export interface IFrameState extends InteractiveRendererState {
  
}

export interface IFrameProps {
  
}


class IFrame extends InteractiveRenderer<IFrameProps, IFrameState> {

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

        model={this.props.data.iframe}
        onCancel={() => this.props.blockProps.services.dismissModal()} 
        onInsert={(iframe) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ iframe });
        }
      }>
        <IFrameEditor 
          model={this.props.data.iframe}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {

    const { src, height, width } = this.props.data.iframe;
    const fullSrc = buildUrl(
        this.props.blockProps.context.baseUrl, 
        this.props.blockProps.context.courseId, 
        this.props.blockProps.context.resourcePath, 
        src);

    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <div>
          <iframe src={fullSrc} height={height} width={width}/>
        </div>
        <Button editMode={this.props.blockProps.editMode} onClick={this.onClick}>Edit</Button>
      </div>);
  }
}

export default IFrame;
