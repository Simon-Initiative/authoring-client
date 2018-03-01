import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { ImageEditor } from '../../../media/ImageEditor';
import { buildUrl } from '../../../../../utils/path';

const IMAGE = require('../../../../../../assets/400x300.png');

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
          parent={null}
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
    if (src === '') {
      fullSrc = IMAGE;
    } else {
      fullSrc = buildUrl(
        this.props.context.baseUrl,
        this.props.context.courseId,
        this.props.context.resourcePath,
        src);
    }

    return (
      <span data-offset-key={this.props.offsetKey}>
        <img
          onClick={this.onClick}
          src={fullSrc}
          height={data.image.height}
          width={data.image.width}
          />
      </span>
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
