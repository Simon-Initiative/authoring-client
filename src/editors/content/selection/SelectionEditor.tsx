import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor,
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { PoolTitleEditor } from './PoolTitleEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { PoolEditor } from './PoolEditor';
import { AddQuestion } from '../question/AddQuestion';
import { PoolRefEditor } from './PoolRefEditor';
import { RemovableContent } from '../common/RemovableContent';
import { DragHandle } from '../../document/assessment/DragHandle';

export interface SelectionProps extends AbstractContentEditorProps<contentTypes.Selection> {
  onRemove: (guid: string) => void;
  isParentAssessmentGraded?: boolean;
  connectDragSource?: any;
}

export interface SelectionState {

}


/**
 * The content editor for HtmlContent.
 */
export class SelectionEditor
  extends AbstractContentEditor<contentTypes.Selection, SelectionProps, SelectionState> {

  constructor(props) {
    super(props);

    this.onStrategyChange = this.onStrategyChange.bind(this);
    this.onExhaustionChange = this.onExhaustionChange.bind(this);
    this.onScopeChange = this.onScopeChange.bind(this);
    this.onCountEdit = this.onCountEdit.bind(this);
    this.onSourceEdit = this.onSourceEdit.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model);
  }

  onStrategyChange(strategy) {
    this.props.onEdit(this.props.model.with({ strategy }));
  }

  onExhaustionChange(exhaustion) {
    this.props.onEdit(this.props.model.with({ exhaustion }));
  }

  onScopeChange(scope) {
    this.props.onEdit(this.props.model.with({ scope }));
  }

  onCountEdit(selectionCount) {
    this.props.onEdit(this.props.model.with({ selectionCount }));
  }

  onSourceEdit(source) {
    this.props.onEdit(this.props.model.with({ source }));
  }

  renderSource() {
    if (this.props.model.source.contentType === 'Pool') {
      return <PoolEditor
               {...this.props}
               model={this.props.model.source}
               onEdit={this.onSourceEdit}
               onRemove={() => this.props.onRemove(this.props.model.guid)}
             />;
    } else {
      return <PoolRefEditor
               {...this.props}
               model={this.props.model.source}
               onEdit={this.onSourceEdit}
               onRemove={() => this.props.onRemove(this.props.model.guid)}
             />;
    }
  }

  onAddQuestion(question: contentTypes.Question) {
    if (this.props.model.source.contentType === 'Pool') {
      const source = this.props.model.source.with(
        { questions: this.props.model.source.questions
          .set(question.guid, question) });
      const updated = this.props.model.with({ source });
      this.props.onEdit(updated);
    }
  }

  onTitleEdit(title) {
    if (this.props.model.source.contentType === 'Pool') {
      const source = this.props.model.source.with({ title });
      this.props.onEdit(this.props.model.with({ source }));
    }
  }

  render() : JSX.Element {

    const label : any = {
      fontFamily: 'sans-serif',
      lineHeight: 1.25,
      fontSize: '13',
      position: 'relative',
      top: '-6',
      color: '#606060',
    };





    const controls = (
      <div>
        <span style={label}>Insert new: </span>
        <AddQuestion
          editMode={this.props.editMode}
          onQuestionAdd={this.onAddQuestion.bind(this)}
          isSummative={true}/>
        <form className="form-inline">
          <Select editMode={this.props.editMode}
            label="Strategy" value={this.props.model.strategy}
            onChange={this.onStrategyChange}>
            <option value="random">Random</option>
            <option value="random_with_replace">Random with replace</option>
            <option value="ordered">Ordered</option>
          </Select>
          <Select editMode={this.props.editMode}
            label="Exhaustion" value={this.props.model.exhaustion}
            onChange={this.onExhaustionChange}>
            <option value="reuse">Reuse</option>
            <option value="skip">Skip</option>
            <option value="fail">Fail</option>
          </Select>
          <Select editMode={this.props.editMode}
            label="Scope" value={this.props.model.scope}
            onChange={this.onScopeChange}>
            <option value="section">Section</option>
            <option value="resource">Resource</option>
          </Select>

          Count:&nbsp;&nbsp;&nbsp;
          <TextInput
            editMode={this.props.editMode}
            width="75px"
            label="Count"
            value={this.props.model.selectionCount}
            type="number"
            onEdit={this.onCountEdit}
          />
        </form>
      </div>);

    const caption = this.props.model.source.contentType === 'Pool' ? 'Pool' : 'Pool Reference';

    let details = '';
    let titleEditor = null;
    if (this.props.model.source.contentType === 'Pool') {
      const count = this.props.model.source.questions.size;
      details = count + ' question' + (count !== 1 ? 's' : '');

      titleEditor =
        <Collapse caption="Title" details={this.props.model.source.title.text}>
            <PoolTitleEditor
              services={this.props.services}
              context={this.props.context}
              editMode={this.props.editMode}
              model={this.props.model.source.title}
              onEdit={this.onTitleEdit}
            />
        </Collapse>;
    }

    return (
      <RemovableContent editMode={this.props.editMode}
        onRemove={this.props.onRemove.bind(this, this.props.model.guid)}
        associatedClasses="selection">

        <div style={ { position: 'relative' } }>

          <Collapse caption={caption}
            details={details}>

            {controls}

            {titleEditor}

            {this.renderSource()}

          </Collapse>

          <div style={ { position: 'absolute', left: '0px', top: '0px' } }>
            <DragHandle connectDragSource={this.props.connectDragSource}/>
          </div>

        </div>

      </RemovableContent>
    );
  }

}

