import * as React from 'react';
import { Image as ImageType } from '../../../../../data/content/html/image';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { ImageEditor } from '../../../media/ImageEditor';
import { buildUrl } from '../../../../../utils/path';

import './markers.scss';

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
  }

  onClick() {
    const b = this.props.blockProps;
    this.props.blockProps.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={b.context}
        services={b.services}

        model={this.props.data.image}
        onCancel={() => this.props.blockProps.services.dismissModal()} 
        onInsert={(image) => {
          this.props.blockProps.services.dismissModal();
          this.props.blockProps.onEdit({ image });
        }
      }>
        <ImageEditor 
          model={this.props.data.image}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {

    const { src, height, width } = this.props.data.image;

    if (src === '') {

      return (
        <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
          <div>
            <img onClick={this.onClick} src="assets/400x300.png" width="400" height="300"/>
          </div>
          <Button editMode={this.props.blockProps.editMode} onClick={this.onClick}>Edit</Button>
        </div>);

    } else {
      const fullSrc = buildUrl(
        this.props.blockProps.context.baseUrl, 
        this.props.blockProps.context.courseId, 
        this.props.blockProps.context.resourcePath, 
        src);
      return (
        <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
          <div>
            <img onClick={this.onClick} src={fullSrc} width={width} height={height}/>
          </div>
          <Button editMode={this.props.blockProps.editMode} onClick={this.onClick}>Edit</Button>
        </div>);
    }
    
  }
}

export default Image;
