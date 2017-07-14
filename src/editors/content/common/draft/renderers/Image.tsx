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
  showEdit: boolean;
}

export interface ImageProps {
  
}


class Image extends InteractiveRenderer<ImageProps, ImageState> {

  constructor(props) {
    super(props, { showEdit: false });

    this.onClick = this.onClick.bind(this);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
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

  onMouseEnter() {
    this.setState({ showEdit: true });
  }

  onMouseLeave() {
    this.setState({ showEdit: false });
  }

  render() : JSX.Element {

    const { src, height, width } = this.props.data.image;

    const buttonDiv : any = {
      position: 'absolute',
      left: 10,
      top: 10,
    };

    const button = this.state.showEdit
      ? <div style={buttonDiv}><Button 
          editMode={this.props.blockProps.editMode} onClick={this.onClick}>Edit</Button>
        </div>
      : null;


    if (src === '') {
      const parentDiv : any = {
        position: 'relative',
        width: '400px',
      };
      return (
        <div ref={c => this.focusComponent = c} 
          onFocus={this.onFocus} onBlur={this.onBlur}>
          <div style={parentDiv} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
            <img onClick={this.onClick} src="assets/400x300.png" width="400" height="300"/>
            {button}
          </div>  
        </div>);

    } else {
      const fullSrc = buildUrl(
        this.props.blockProps.context.baseUrl, 
        this.props.blockProps.context.courseId, 
        this.props.blockProps.context.resourcePath, 
        src);
      const parentDiv : any = {
        position: 'relative',
        width,
      };
      return (
        <div ref={c => this.focusComponent = c} 
          onFocus={this.onFocus} onBlur={this.onBlur}>
          <div style={parentDiv} 
            onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
            <img onClick={this.onClick} src={fullSrc} width={width} height={height}/>
            {button}
          </div>
          
        </div>);
    }
    
  }
}

export default Image;
