import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { XrefEditor } from '../../../links/XrefEditor';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

class Xref extends React.PureComponent<any, any> {

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

        model={data.xref}
        onCancel={() => this.props.services.dismissModal()}
        onInsert={(xref) => {
          this.props.services.dismissModal();
          const data = {
            xref,
          };
          const contentState = this.props.contentState.replaceEntityData(key, data);

          this.props.onEdit(contentState);
        }
      }>
        <XrefEditor
          model={data.xref}
          context={b.context}
          services={b.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {
    return (
      <a
        className="editor-link"
        data-offset-key={this.props.offsetKey}
        ref={a => this.a = a} onClick={this.onClick}>
        {this.props.children}
      </a>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.xref),
    component: Xref,
    props,
  };
}
