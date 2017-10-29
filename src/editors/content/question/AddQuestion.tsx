import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import guid from '../../../utils/guid';


export interface AddQuestion {
  
}

export interface AddQuestionProps {

  // Whether or not editing is allowed
  editMode: boolean;

  // True if this is being used in the context of a summative
  // assessment
  isSummative: boolean;

  // Callback to execute when a new question has been added
  onQuestionAdd: (question: contentTypes.Question) => void;
}

export interface AddQuestionState {

}

/**
 * Reusable component for adding new questions to a question
 * container (pool, assessment, etc)
 */
export class AddQuestion 
  extends React.Component<AddQuestionProps, AddQuestionState> {
    
  constructor(props) {
    super(props);

    this.onAddMultipleChoice = this.onAddMultipleChoice.bind(this);
    this.onAddEssay = this.onAddEssay.bind(this);
    this.onAddMultipart = this.onAddMultipart.bind(this);
    this.onAddOrdering = this.onAddOrdering.bind(this);
    this.onAddShortAnswer = this.onAddShortAnswer.bind(this);
  }

  onAddMultipleChoice(select: string) {
    
    let model = new contentTypes.Question();
    let item = new contentTypes.MultipleChoice();
    
    const value = select === 'multiple' ? 'A' : guid().replace('-', '');
    const match = select === 'multiple' ? 'A' : value; 
    
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
    
    this.props.onQuestionAdd(model);
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

    this.props.onQuestionAdd(question);
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

    this.props.onQuestionAdd(question);
  }

  onAddEssay() {
    
    const item = new contentTypes.Essay();

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

    this.props.onQuestionAdd(question);
  }

  onAddMultipart() {
    this.props.onQuestionAdd(new contentTypes.Question());
  }
    
  render() {
    
    const essayOrNot = this.props.isSummative
      ? <a onClick={this.onAddEssay} className="dropdown-item">Essay</a>
      : null;

    return (
      <div className="dropdown" style={ { display: 'inline' } }>
        <button disabled={!this.props.editMode} 
          className="btn btn-secondary btn-link dropdown-toggle" 
          type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <b>Question</b>
        </button>
        <div className="dropdown-menu">
          <a onClick={(e) => { e.preventDefault(); this.onAddMultipleChoice('single'); }} 
            className="dropdown-item">Multiple choice</a>
          <a onClick={(e) => { e.preventDefault(); this.onAddMultipleChoice('multiple'); }} 
            className="dropdown-item">Check all that apply</a>
          <a onClick={this.onAddOrdering} className="dropdown-item">Ordering</a>
          <a onClick={this.onAddShortAnswer} className="dropdown-item">Short answer</a>
          {essayOrNot}
          <a onClick={this.onAddMultipart} 
            className="dropdown-item">Input (Text, Numeric, Dropdown)</a>
        </div>
      </div>
    );
    
  }

}
