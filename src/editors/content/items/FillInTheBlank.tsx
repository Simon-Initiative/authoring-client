
import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractItemPartEditor, AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';

import { FeedbackEditor } from '../part/FeedbackEditor';
import { Hints } from '../part/Hints';
import { TextInput, InlineForm, Button, Checkbox, Collapse } from '../common/controls';
import guid from '../../../utils/guid';

import '../common/editor.scss';
import './MultipleChoice.scss';

type IdTypes = {
  shuffle: string
}

export interface FillInTheBlank {
  ids: IdTypes;
}

export interface FillInTheBlankProps extends AbstractItemPartEditorProps<contentTypes.FillInTheBlank> {

}

export interface FillInTheBlankState {

}

const ChoiceFeedback = (props) => {
  return (
    <div className='ChoiceFeedback'>
      {props.children}
    </div>
  )
}

/**
 * The content editor for HtmlContent.
 */
export class FillInTheBlank 
  extends AbstractItemPartEditor<contentTypes.FillInTheBlank, FillInTheBlankProps, FillInTheBlankState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: []
    };
    this.ids = {
      shuffle: guid()
    }
    this.onAddChoice = this.onAddChoice.bind(this);
    this.onShuffleChange = this.onShuffleChange.bind(this);
    this.onChoiceEdit = this.onChoiceEdit.bind(this);
    this.onHintsEdit = this.onHintsEdit.bind(this);
  }

  onShuffleChange(e) {
    this.props.onEdit(this.props.itemModel.with({shuffle: e.target.value}), this.props.partModel);
  }

  onAddChoice() {
    const value = guid();
    const match = value; 
    const choice = new contentTypes.Choice({value});
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response({match});
    response = response.with({feedback: response.feedback.set(feedback.guid, feedback)});

    let itemModel = this.props.itemModel.with({choices: this.props.itemModel.choices.set(choice.guid, choice) });
    let partModel = this.props.partModel.with({responses: this.props.partModel.responses.set(response.guid, response)});

    this.props.onEdit(itemModel, partModel);
  }

  onChoiceEdit(c) {
    this.props.onEdit(this.props.itemModel.with({choices: this.props.itemModel.choices.set(c.guid, c) }), this.props.partModel);
  }

  onFeedbackEdit(response : contentTypes.Response, feedback: contentTypes.Feedback) {
    response = response.with({ feedback: response.feedback.set(feedback.guid, feedback) });
    let part = this.props.partModel.with({responses: this.props.partModel.responses.set(response.guid, response) });
    this.props.onEdit(this.props.itemModel, part);
  }

  renderChoice(choice: contentTypes.Choice, response : contentTypes.Response,) {
    return <Choice 
              key={choice.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={choice}
              onEdit={this.onChoiceEdit} 
              onRemove={this.onRemoveChoice.bind(this, choice, response)}
              />;
  }

  onHintsEdit(partModel: contentTypes.Part) {
    this.props.onEdit(this.props.itemModel, partModel);
  }

  onScoreEdit(response: contentTypes.Response, score: string) {
    response = response.with({score});
    const partModel = this.props.partModel.with({responses: this.props.partModel.responses.set(response.guid, response)});
    this.props.onEdit(this.props.itemModel, partModel);
  }

  renderFeedback(choice: contentTypes.Choice, response : contentTypes.Response, feedback: contentTypes.Feedback) {
    return (
      <FeedbackEditor 
        key={feedback.guid}
        editMode={this.props.editMode}
        services={this.props.services}
        context={this.props.context}
        model={feedback}
        onRemove={this.onRemoveChoice.bind(this, choice, response)}
        onEdit={this.onFeedbackEdit.bind(this, response)} 
        />);
  }

  onRemoveChoice(choice, response) {
    let itemModel = this.props.itemModel.with({choices: this.props.itemModel.choices.delete(choice.guid) });
    let partModel = this.props.partModel.with({responses: this.props.partModel.responses.delete(response.guid)});

    this.props.onEdit(itemModel, partModel);
  }

  onShuffleEdit(shuffle: boolean) {
    const itemModel = this.props.itemModel.with({shuffle});
    this.props.onEdit(itemModel, this.props.partModel);
  }

  renderChoices() {

    const responses = this.props.partModel.responses.toArray();
    const choices = this.props.itemModel.choices.toArray();

    const rendered = [];

    for (let i = 0; i < choices.length; i++) {
      let c = choices[i];

      let renderedFeedback = null;

      if (responses.length > i) {
        if (responses[i].feedback.size > 0) {
          let f = responses[i].feedback.first();
          renderedFeedback = this.renderFeedback(c, responses[i], f)
        }
      }
      
      rendered.push(
        <ChoiceFeedback key={c.guid}>
          {this.renderChoice(c, responses[i])}
          {renderedFeedback}
          <InlineForm position='right'>
            <TextInput label='Score' value={responses[i].score} type='number' width='75px'
                onEdit={this.onScoreEdit.bind(this, responses[i])}/>
          </InlineForm>
        </ChoiceFeedback>);
    }

    return rendered;
  }

  render() : JSX.Element {
    
    const bodyStyle = {
      minHeight: '75px',
      borderStyle: 'solid',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    const expanded = (
      <div style={{display: 'inline'}}>
        <Button type='link' onClick={this.onAddChoice}>Add Choice</Button>
        <Checkbox label='Shuffle' value={this.props.itemModel.shuffle} onEdit={this.onShuffleEdit}/>
      </div>);

    return (
      <div>
        <Collapse caption='Choices' expanded={expanded}>
          {this.renderChoices()}
        </Collapse>
        <Hints
            context={this.props.context}
            services={this.props.services}
            model={this.props.partModel}
            editMode={this.props.editMode}
            onEdit={this.onHintsEdit}
          />
      </div>);
  }

}

