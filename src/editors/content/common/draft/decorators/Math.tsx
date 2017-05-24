import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import { Math as MathRenderer } from '../../../../../utils/math/Math';
import { ContentState, Entity } from 'draft-js';

import { AppServices } from '../../../../common/AppServices';

import { ModalMathEditor } from '../../../../../utils/math/ModalMathEditor';

interface Math {
  _onClick: any;
}

interface MathProps {
  
  services: AppServices;
  offsetKey: string;
  contentState: ContentState;
  entityKey: string;
  onEdit: () => void;
}

class Math extends React.PureComponent<MathProps, any> {

  constructor(props) {
    super(props);

    this._onClick = this.onClick.bind(this);
  }

  onClick() {

    const entity = this.props.contentState.getEntity(this.props.entityKey);
    const { data } = entity;
    const math = data['#cdata'];

    const editor = <ModalMathEditor content={math} 
      onCancel={() => this.props.services.dismissModal()}
      onInsert={(content) => {

        const toMerge = {};
        toMerge['#cdata'] = content;

        Entity.mergeData(this.props.entityKey, toMerge);
        this.forceUpdate();
        this.props.onEdit(); 

        this.props.services.dismissModal();

      }}/>;

    this.props.services.displayModal(editor);
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const math = data['#cdata'];

    return (
      <span onClick={this._onClick} data-offset-key={this.props.offsetKey}>
        <MathRenderer inline>{math}</MathRenderer>
      </span>
    );
  }
}


export default function(props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.math),
    component: Math,
    props,
  };
};