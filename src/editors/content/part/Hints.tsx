import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import guid from '../../../utils/guid';
import { HintEditor } from './HintEditor';

import { TextInput, InlineForm, Button, Checkbox, Collapse } from '../common/controls';

export interface Hints {
  
}

export interface HintsProps {
  model: contentTypes.Part
  onEdit: (model: contentTypes.Part) => void;
  context: AppContext;
  editMode: boolean;
  services: AppServices;
}

export interface HintsState {
  
}

/**
 * The content editor for HtmlContent.
 */
export abstract class Hints 
  extends React.PureComponent<HintsProps, HintsState> {
    
  constructor(props) {
    super(props);

    this.onAddHint = this.onAddHint.bind(this);
    this.onHintEdit = this.onHintEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }
  
  onAddHint() {
    let content = new contentTypes.Hint();
    this.props.onEdit(this.props.model.with({hints: this.props.model.hints.set(content.guid, content) }));
  }

  onHintEdit(hint: contentTypes.Hint) {
    this.props.onEdit(this.props.model.with({hints: this.props.model.hints.set(hint.guid, hint) }));
  }

  onRemove(hint: contentTypes.Hint) {
    this.props.onEdit(this.props.model.with({hints: this.props.model.hints.delete(hint.guid) }));
  }

  renderHints() {
    return this.props.model.hints.toArray().map(i => {
      return <HintEditor
              context={this.props.context}
              key={i.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              model={i}
              onEdit={this.onHintEdit} 
              onRemove={this.onRemove}
              />
    });
  }

  render() : JSX.Element {

    const expanded = (
      <InlineForm position='right'>
        <Button onClick={this.onAddHint}>Add Hint</Button>
      </InlineForm>
    );

    return (
      <Collapse 
        caption='Hints' 
        details='Expand to edit the hints'
        expanded={expanded}>

        {this.renderHints()}

      </Collapse>
    );
  }

}

