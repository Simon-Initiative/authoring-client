import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { ImageEditor } from '../../../media/ImageEditor';

class Image extends React.PureComponent<any, any> {

  a: any;

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    
    const b = this.props;
    this.props.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={b.context}
        services={b.services}

        model={data.image}
        onCancel={() => this.props.services.dismissModal()} 
        onInsert={(image) => {
          this.props.services.dismissModal();

          const updatedData = {
            image,
          };
          const contentState = this.props.contentState.replaceEntityData(
            this.props.entityKey, updatedData);

          this.props.onEdit(contentState);
        }
      }>
        <ImageEditor 
          model={data.image}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const src = data.image.src;
    let fullSrc;
    if (src.startsWith('..')) {
      fullSrc = this.props.context.baseUrl 
        + '/' + this.props.context.courseId
        + '/' 
        + this.props.context.resourcePath 
        + '/' + src;
    } else {
      fullSrc = src;
    }

    return (
      <img 
        onClick={this.onClick}
        src={fullSrc}
        height={data.image.height}
        width={data.image.width}
        data-offset-key={this.props.offsetKey}/>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.image),
    component: Image,
    props,
  };
}
