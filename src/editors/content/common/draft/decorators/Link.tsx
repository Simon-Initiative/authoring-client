import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import { LinkEditor } from '../../../links/LinkEditor';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

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
    this.props.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={b.context}
        services={b.services}

        model={data.link}
        onCancel={() => this.props.services.dismissModal()} 
        onInsert={(link) => {
          this.props.services.dismissModal();
          const data = {
            link,
          };
          const contentState = this.props.contentState.replaceEntityData(key, data);

          this.props.onEdit(contentState);
        }
      }>
        <LinkEditor 
          model={data.link}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    return (
      <a className="editor-link" 
        data-offset-key={this.props.offsetKey} 
        ref={a => this.a = a} onClick={this.onClick}>
        {this.props.children}
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
