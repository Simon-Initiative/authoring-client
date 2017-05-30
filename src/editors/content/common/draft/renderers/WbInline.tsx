import * as React from 'react';
import { WbInline as WbInlineType } from '../../../../../data/content/html/wbinline';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState} from './InteractiveRenderer'
import { BlockProps } from './properties';
import { Select } from '../../Select';
import { PurposeTypes } from '../../../../../data/content/html/common';

import './wbinline.scss';

type Data = {
  wbinline: WbInlineType;
}

export interface WbInlineProps extends InteractiveRendererProps {
  data: Data;
}

export interface WbInlineState extends InteractiveRendererState {
  title: string;
}

export interface WbInlineProps {
  
}


export class WbInline extends InteractiveRenderer<WbInlineProps, WbInlineState> {

  constructor(props) {
    super(props, { title: ''});

    this.onPurposeEdit = this.onPurposeEdit.bind(this);
    this.onClick = this.onClick.bind(this);

    this.props.blockProps.services.titleOracle.getTitle(this.props.data.wbinline.idRef, 'AssessmentModel')
      .then(title => this.setState({title}));
  }

  onClick() {
    this.props.blockProps.services.viewDocument(this.props.data.wbinline.idRef);
  }

  onPurposeEdit(purpose) {
    this.props.blockProps.onEdit({wbinline: this.props.data.wbinline.with({purpose})});
  }

  render() : JSX.Element {
    return (
      <div className='wbinline' ref={(c) => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
        <button onClick={this.onClick} type="button" className="btn btn-link">{this.state.title}</button>
        <Select editMode={this.props.blockProps.editMode} 
          label='Purpose' value={this.props.data.wbinline.purpose} onChange={this.onPurposeEdit}>
          {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </div>);
  }
};