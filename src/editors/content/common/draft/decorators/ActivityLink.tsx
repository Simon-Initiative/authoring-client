import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { ActivityLinkEditor } from '../../../links/ActivityLinkEditor';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

import './styles.scss';

class ActivityLink extends React.PureComponent<any, any> {

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
    const purpose = data['@purpose'];
    return (
      <a
        className="editor-link"
        data-offset-key={this.props.offsetKey}
        ref={a => this.a = a} data-toggle="tooltip"
        data-placement="top" title={purpose}>
        {this.props.children}
      </a>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.activity_link),
    component: ActivityLink,
    props,
  };
}
