import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { CiteEditor } from '../../../links/CiteEditor';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

class Cite extends React.PureComponent<any, any> {

  a: any;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    (window as any).$(this.a).tooltip();
  }

  componentWillUnmount() {
    (window as any).$(this.a).tooltip('hide');
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const entry = data['@entry'];
    return (
      <a
        className="editor-link"
        data-offset-key={this.props.offsetKey}
        ref={a => this.a = a} data-toggle="tooltip"
        data-placement="top" title={entry}>
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
