import * as React from 'react';
import { WbInline as WbInlineType } from '../../../../../data/content/html/wbinline';
import PreformattedText from './PreformattedText';
import { InteractiveRenderer, InteractiveRendererProps, 
  InteractiveRendererState} from './InteractiveRenderer';
import * as persistence from '../../../../../data/persistence';

import { BlockProps } from './properties';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { PurposeTypes } from '../../../../../data/content/html/common';
import { handleInsertion } from './common';
import { LegacyTypes } from '../../../../../data/types';

import ResourceSelection from '../../../../../utils/selection/ResourceSelection';

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

    
  }

  componentDidMount() {
    this.props.blockProps.services
      .titleOracle.getTitle(
        this.props.blockProps.context.courseId, 
        this.props.data.wbinline.idRef, 'AssessmentModel')
      .then(title => this.setState({ title }));
  }

  onClick() {
    this.props.blockProps.services.viewDocument(this.props.data.wbinline.idRef);
  }

  onPurposeEdit(purpose) {
    this.props.blockProps.onEdit({wbinline: this.props.data.wbinline.with({purpose})});
  }

  onCancel() {
    this.props.blockProps.services.dismissModal();
  }

  onInsert(resource) {
    this.props.blockProps.services.dismissModal();
    this.props.blockProps.onEdit(
      { activity: this.props.data.wbinline.with({ idRef: resource.id }) });
  }

  onSelectActivity() {

    const predicate =
      (res: persistence.CourseResource) : boolean => {
        return res.type === LegacyTypes.inline;
      };

    this.props.blockProps.services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={this.props.blockProps.context.courseId}
          onInsert={this.onInsert} 
          onCancel={this.onCancel}/>);
  }

  render() : JSX.Element {
    return (
      <div className='wbinline' 
        ref={(c) => this.focusComponent = c} onFocus={this.onFocus} 
        onBlur={this.onBlur}  onClick={handleInsertion.bind(undefined, this.props)}>
        <b>Inline Assessment:</b>&nbsp;&nbsp;&nbsp;
        <button onClick={this.onClick} type="button" 
          className="btn btn-link">{this.state.title}</button>
        <Button editMode={this.props.blockProps.editMode} 
          onClick={this.onSelectActivity}>Set</Button>
        <Select editMode={this.props.blockProps.editMode} 
          label='Purpose' value={this.props.data.wbinline.purpose} onChange={this.onPurposeEdit}>
          {PurposeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </div>);
  }
};