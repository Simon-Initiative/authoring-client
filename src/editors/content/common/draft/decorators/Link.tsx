import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { LinkEditor } from '../../../links/LinkEditor';
import { ImageLinkEditor } from '../../../links/ImageLinkEditor';

import ModalMediaEditor from '../../../media/ModalMediaEditor';
import { Image } from '../../../../../data/content/learning/image';

class Link extends React.PureComponent<any, any> {

  a: any;

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const key = this.props.entityKey;
    const data = this.props.contentState.getEntity(key).getData();
    const b = this.props;

    let child;
    let model;
    if (data.link.content instanceof Image) {
      model = { link: data.link, image: data.link.content };
      child = <ImageLinkEditor
          parent={null}
          model={model}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>;
    } else {
      model = data.link;
      child = <LinkEditor
          parent={null}
          model={model}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>;
    }



    this.props.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={b.context}
        services={b.services}
        model={model}
        onCancel={() => this.props.services.dismissModal()}
        onInsert={(model) => {
          this.props.services.dismissModal();

          const data : any = {};
          if (model.image !== undefined) {
            data.link = model.link.with({ content: model.image });
          } else {
            data.link = model;
          }

          const contentState = this.props.contentState.replaceEntityData(key, data);

          this.props.onEdit(contentState);
        }
      }>
        {child}
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    let children;
    if (data.link.content instanceof Image) {

      const src = data.link.content.src;
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

      children =
        <img
          onClick={this.onClick}
          src={fullSrc}
          height={data.link.content.height}
          width={data.link.content.width}/>;

    } else {
      children = this.props.children;
    }


    return (
      <a className="editor-link"
        data-offset-key={this.props.offsetKey}
        ref={a => this.a = a} onClick={this.onClick}>
        {children}
      </a>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.link),
    component: Link,
    props,
  };
}
