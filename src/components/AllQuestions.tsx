'use strict'

import * as React from 'react';
import { connect }  from 'react-redux';

import { viewActions } from '../actions/view';
import { dataActions } from '../actions/data';
import InlineQuestion from '../activity/InlineQuestion';

interface AllQuestions {
  onCreate: () => void;
}

export interface AllQuestionsProps {
  dispatch: any;
  questions: Object[]
}

class AllQuestions extends React.PureComponent<AllQuestionsProps, {}> {

  constructor(props) {
    super(props);

    this.onCreate = this._onCreate.bind(this);
  }

  _onCreate() {
    this.props.dispatch(dataActions.createQuestion((this.refs as any).title.value));
  }

  renderQuestions() {

    let blockProps = {
      onEditMode: () => false
    }

    if (this.props.questions.length === 0) {

      return <div>No questions created, yet...</div>;

    } else {

      let questions = this.props.questions.map(p => {
        const { _id, stem} = (p as any);
        return <tr key={_id}><td>
            <InlineQuestion blockProps={blockProps} questionId={_id}/>
          </td></tr>
      });

      return (
        <table className="table table-striped table-hover"> 
          <thead>
              <tr>
                  <th>Questions</th>
              </tr>
          </thead>
          <tbody>
            {questions}
          </tbody>
        </table>);
    }

  }

  render() {

    
    return (
      <div className="container"> 
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                      {this.renderQuestions()}
                      <div className="divider"></div>
                      <div className="input-group">
                        <span className="input-group-addon">New question</span>
                        <input ref="title" type="text" className="form-input" placeholder="Question stem" />
                        <button onClick={this.onCreate} className="btn btn-primary input-group-btn">Create</button>
                      </div>
                    </div>
                </div>
                <div className="column col-1"></div>
            </div>
      </div>


      );
  }
}


function subscribedState(state: any): Object {

  const {
    questions
  } = state;

  return {
    questions
  }
}


export default connect(subscribedState)(AllQuestions);



