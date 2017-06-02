import * as React from 'react';
import { Image as ImageType } from '../../../../../data/content/html/image';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import { BlockProps } from './properties';
import { Button } from '../../Button';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { ImageEditor } from '../../../media/ImageEditor';

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

    const { src } = this.props.data.image;

    const fullSrc = this.props.blockProps.context.baseUrl 
        + '/' + this.props.blockProps.context.courseId
        + '/webcontents/' 
        + this.props.blockProps.context.resourcePath 
        + '/' + src;

    console.log(fullSrc);
    
    return (
      <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <div>
          <img src={fullSrc}/>
        </div>
        <Button editMode={this.props.blockProps.editMode} onClick={this.onClick}>Edit</Button>
      </div>);
  }
}

export default Image;
