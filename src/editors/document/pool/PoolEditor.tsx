import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import { PoolEditor as PoolContentEditor } from '../../content/selection/PoolEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import guid from '../../../utils/guid';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface PoolEditor {
  
}

export interface PoolEditorProps extends AbstractEditorProps<models.PoolModel> {
  
}

interface PoolEditorState extends AbstractEditorState {
  
}

@DragDropContext(HTML5Backend)
class PoolEditor extends AbstractEditor<models.PoolModel,
  PoolEditorProps, 
  PoolEditorState>  {

  constructor(props) {
    super(props, {});

    this.onEdit = this.onEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);

    this.onAddOrdering = this.onAddOrdering.bind(this);
    this.onAddShortAnswer = this.onAddShortAnswer.bind(this);
    this.onAddMultipart = this.onAddMultipart.bind(this);
  }
    
  onEdit(pool: contentTypes.Pool) {
    this.handleEdit(this.props.model.with({ pool }));
  }

  addQuestion(q) {
    
    const pool = this.props.model.pool.with( 
      { questions: this.props.model.pool.questions.set(q.guid, q) });
    const updated = this.props.model.with({ pool });
    this.handleEdit(updated);
  }

  onTitleEdit(title) {
    const pool = this.props.model.pool.with({ title });
    const updated = this.props.model.with({ pool });
    this.handleEdit(updated);
  }


  onAddMultipleChoice(select: string) {
    
    let model = new contentTypes.Question();
    let item = new contentTypes.MultipleChoice();
    
    const value = guid().replace('-', '');
    const match = select ? 'A' : value; 
    const choice = new contentTypes.Choice({ value, guid: guid() });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response({ match });
    response = response.with({ guid: guid(), 
      feedback: response.feedback.set(feedback.guid, feedback) });

    const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
    const responses = Immutable.OrderedMap<string, contentTypes.Response>()
      .set(response.guid, response);

    item = item.with({ guid: guid(), select, choices });

    model = model.with({ items: model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({ guid: guid(), responses });
    model = model.with({ parts: model.parts.set(part.guid, part) });
    
    this.addQuestion(model);
  }

  onAddOrdering() {

    const value = 'A';
    
    let question = new contentTypes.Question();

    const choice = new contentTypes.Choice().with({ value, guid: guid() });
    const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
    const item = new contentTypes.Ordering().with({ choices });
    question = question.with({ items: question.items.set(item.guid, item) });

    const part = new contentTypes.Part();
    question = question.with({ parts: question.parts.set(part.guid, part) });

    this.addQuestion(question);
  }

  onAddShortAnswer() {

    const item = new contentTypes.ShortAnswer();

    const response = new contentTypes.Response({ match: '*', score: '1' });

    const part = new contentTypes.Part()
      .with({ responses: Immutable.OrderedMap<string, contentTypes.Response>()
        .set(response.guid, response),
      });

    const question = new contentTypes.Question()
        .with({
          items: Immutable.OrderedMap<string, contentTypes.QuestionItem>()
            .set(item.guid, item),
          parts: Immutable.OrderedMap<string, contentTypes.Part>()
            .set(part.guid, part),
        });

    this.addQuestion(question);
  }

  onAddMultipart() {
    this.addQuestion(new contentTypes.Question());
  }

  renderAddQuestion() {
    return (
      <div className="dropdown" style={ { display: 'inline' } }>
        <button disabled={!this.props.editMode} 
          className="btn btn-secondary btn-link dropdown-toggle" 
          type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <b>Add Question</b>
        </button>
        <div className="dropdown-menu">
          <a onClick={(e) => { e.preventDefault(); this.onAddMultipleChoice('single'); }} 
            className="dropdown-item">Multiple choice</a>
          <a onClick={(e) => { e.preventDefault(); this.onAddMultipleChoice('multiple'); }} 
            className="dropdown-item">Check all that apply</a>
          <a onClick={this.onAddOrdering} className="dropdown-item">Ordering</a>
          <a onClick={this.onAddShortAnswer} className="dropdown-item">Short answer</a>
          <a onClick={this.onAddMultipart} 
            className="dropdown-item">Multi-part (Text, Numeric, Dropdown)</a>
        </div>
      </div>
    );
    
  }
    

  render() {
    return (
      <div>
        <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
        <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.pool.title}
            onEdit={this.onTitleEdit} 
            />
        <div>
          {this.renderAddQuestion()}
        </div>
        <PoolContentEditor
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={() => null}
          model={this.props.model.pool}
          onEdit={this.onEdit}/>
        
      </div>
    );    
  }

}

export default PoolEditor;
