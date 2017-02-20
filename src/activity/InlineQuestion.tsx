
import * as React from 'react';
import * as persistence from '../data/persistence'

interface InlineQuestion {
  currentAnswer: boolean;
}

export interface InlineQuestionProps {
  questionId: string;
  blockProps: any;
}

class InlineQuestion extends React.PureComponent<InlineQuestionProps, { editMode, answer, editStem, question }> {

  constructor(props) {
    super(props);
    this.state = {editMode: false, answer: null, editStem: null,  question: { stem: "", answer: null}};
    this.currentAnswer = null;
  }

  componentDidMount() {
    persistence.retrieveDocument(this.props.questionId)
      .then(doc => this.setState({ question: doc.content, editStem: (doc.content as any).stem}))
      .catch(err => {
        // TODO: unified error handling 
      });
  }

  onSubmit() {
    if (this.currentAnswer !== null) {
      this.setState({
        answer: this.currentAnswer
      });
    }
  }

  toggleViewEdit() {
    let nextEditMode = !this.state.editMode;
    this.setState({ editMode: nextEditMode});
    this.props.blockProps.onEditMode(nextEditMode);
  }

  handleOptionChange(changeEvent) {
    this.currentAnswer = changeEvent.target.value === "true" ? true : false
  }

  handleStemChange(changeEvent) {
    this.setState({editStem: changeEvent.target.value});
  }

  issueSave() {
    var updated = Object.assign({}, this.state.question, { stem: this.state.editStem, answer: this.currentAnswer });
    
    persistence.persistDocument(this.props.questionId, this.state.question)
      .then(update => {
        this.setState({editMode: false, question: { _rev: update.rev, stem: updated.stem, answer: updated.answer}, answer: null});
        this.props.blockProps.onEditMode(false);
      })
      .catch(err => {
        // TODO unified err handling
      });
    
  }

  renderViewMode() {
    let style = { backgroundColor: '#DDDDDD', userSelect: "none"};

    let feedback;
    let disabled;
    if (this.state.answer !== null) {
      let correct = this.state.answer === this.state.question.answer;
      feedback = <p>You answered {correct ? 'correctly' : 'incorrectly'}</p>;
      disabled = true;
    } else {
      feedback = <button onClick={() => this.onSubmit()} className="btn btn-primary">Submit Answer</button>;
      disabled = false; 
    }


    return <div style={style} className="container">
            <div className="columns">
                <div className="column col-1"><span onClick={() => this.toggleViewEdit()} className="label label-primary">Edit</span></div>
                <div className="column col-8">
                  <div className="form-group">
                    <label className="form-label"><b>{this.state.question.stem}</b></label>
                    <label className="form-radio">
                        <input onChange={this.handleOptionChange.bind(this)} type="radio" 
                          name={this.props.questionId} value="true" disabled={disabled} />
                        <i className="form-icon"></i> True
                    </label>
                    <label className="form-radio">
                        <input onChange={this.handleOptionChange.bind(this)} type="radio" 
                          name={this.props.questionId} value="false" disabled={disabled}/>
                        <i className="form-icon"></i> False
                    </label>
                </div>
                </div>
                <div className="column col-3">
                  {feedback}
                </div>
            </div>
        </div>
  }

  renderEditMode() {
    let style = { backgroundColor: '#DDDDDD'};

    
    return <div style={style} className="container">
            <div className="columns">
                <div className="column col-1">
                  <span onClick={() => this.toggleViewEdit()} className="label ">Cancel</span><br/>
                  <span onClick={this.issueSave.bind(this)} className="label label-primary">Save</span>
                
                </div>
                <div className="column col-8">
                  <div className="form-group">

                    <input onChange={this.handleStemChange.bind(this)} className="form-input" type="text" value={this.state.editStem}/>

                    <label className="form-radio">
                        <input onChange={this.handleOptionChange.bind(this)} type="radio" 
                          name={this.props.questionId} value="true"  />
                        <i className="form-icon"></i> True
                    </label>
                    <label className="form-radio">
                        <input onChange={this.handleOptionChange.bind(this)} type="radio" 
                          name={this.props.questionId} value="false" />
                        <i className="form-icon"></i> False
                    </label>
                </div>
                </div>
                <div className="column col-3">
                  
                </div>
            </div>
        </div>
  }

  render() {
    if (this.state.editMode) {
      return this.renderEditMode();
    } else {
      return this.renderViewMode();
    }
  }
};

export default InlineQuestion;


