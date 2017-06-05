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
  onEdit: (c: ContentState) => void;
}

class Math extends React.PureComponent<MathProps, any> {

  attribute: string;

  constructor(props) {
    super(props);

    this._onClick = this.onClick.bind(this);
  }

  onClick() {

    const entity = this.props.contentState.getEntity(this.props.entityKey);
    const { data } = entity;
    const math = data[this.attribute];

    const editor = <ModalMathEditor content={math} 
      onCancel={() => this.props.services.dismissModal()}
      onInsert={(content) => {

        this.props.services.dismissModal();

        const toMerge = {};
        toMerge[this.attribute] = content;
        
        const contentState = this.props.contentState
          .replaceEntityData(this.props.entityKey, toMerge);

        this.props.onEdit(contentState); 
      }}/>;

    this.props.services.displayModal(editor);
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    
    let math;
    if (data['#cdata'] !== undefined) {
      math = data['#cdata'];
      this.attribute = '#cdata';
    } else {
      math = data['#math'];
      this.attribute = '#math';
    }

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