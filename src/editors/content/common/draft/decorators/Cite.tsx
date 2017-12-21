import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import { CiteEditor } from '../../../links/CiteEditor';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

class Cite extends React.PureComponent<any, any> {

  a: any;

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    (window as any).$(this.a).tooltip();
  }

  componentWillUnmount() {
    (window as any).$(this.a).tooltip('hide');
  }

  onClick() {
    const key = this.props.entityKey;
    const data = this.props.contentState.getEntity(key).getData();
    
    this.props.services.displayModal(
      <ModalMediaEditor
        editMode={true}
        context={this.props.context}
        services={this.props.services}

        model={data.cite}
        onCancel={() => this.props.services.dismissModal()} 
        onInsert={(cite) => {
          this.props.services.dismissModal();
          const data = {
            cite,
          };
          const contentState = this.props.contentState.replaceEntityData(key, data);

          this.props.onEdit(contentState);
        }
      }>
        <CiteEditor 
          model={data.cite}
          context={this.props.context}
          services={this.props.services}
          editMode={true}
          onEdit={c => true}/>
      </ModalMediaEditor>,
    );
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const entry = data['@entry'];
    return (
      <a
        className="editor-link" 
        data-offset-key={this.props.offsetKey} 
        ref={a => this.a = a} data-toggle="tooltip" 
        data-placement="top" title={entry} onClick={this.onClick}>
        {this.props.children}
      </a>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.cite),
    component: Cite,
    props,
  };
}
