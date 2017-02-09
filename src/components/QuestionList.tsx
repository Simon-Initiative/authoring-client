'use strict'

import * as React from 'react';

interface QuestionList {
  
}

export interface QuestionListProps {
  questions: Object[];
  onSelect: (string) => void;
}

class QuestionList extends React.PureComponent<QuestionListProps, {selected}> {

  constructor(props) {
    super(props);
    this.state = {selected: null};
  }

  selected(id) {
    this.props.onSelect(id);
    this.setState({selected: id});
  }

  render() {

      let rows = this.props.questions.map((q, i) => {
        const { _id, stem} = (q as any);
        let isSelected = _id === this.state.selected ? 'selected' : '';
        return <tr className={isSelected} key={_id}><td>
            <button key={_id} onClick={this.selected.bind(this, _id)} 
              className="btn btn-link">{stem}</button>
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
            {rows}
          </tbody>
        </table>);
  }
  

}

export default QuestionList;


