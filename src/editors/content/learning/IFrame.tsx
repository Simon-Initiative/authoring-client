import * as React from 'react';
import { IFrame as IFrameType } from 'data/content/learning/iframe';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import ModalMediaEditor from 'editors/content/media/ModalMediaEditor';
import { IFrameEditor } from 'editors/content/media/IFrameEditor';
import { buildUrl } from 'utils/path';
import AutoHideEditRemove from './AutoHideEditRemove';

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
    this.onRemove = this.onRemove.bind(this);
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

  onRemove() {
    this.props.blockProps.onRemove();
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
        <AutoHideEditRemove onEdit={this.onClick} onRemove={this.onRemove}
          editMode={this.props.blockProps.editMode} >
          <iframe src={fullSrc} height={height} width={width}/>
        </AutoHideEditRemove>

      </div>);
  }
}

export default IFrame;
