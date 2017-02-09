import * as React from 'react';

import ModalSelection from './ModalSelection';
import QuestionList from './QuestionList';

interface QuestionSelection {
  selectedId: string;
}

export interface QuestionSelectionProps {
  questions: Object[];
  onInsert: (type, data) => void;
  onCancel: () => void;
}

class QuestionSelection extends React.PureComponent<QuestionSelectionProps, {}> {

  constructor(props) {
    super(props);

    this.selectedId = null;
  }

  render() {
    return (
      <ModalSelection title="Select Question" 
        onCancel={this.props.onCancel} 
        onInsert={() => this.props.onInsert('inline-question', { questionId: this.selectedId})}>

        <QuestionList onSelect={(id) => this.selectedId = id} questions={this.props.questions} />
      
      </ModalSelection>    
      );
  }

}




export default QuestionSelection;


