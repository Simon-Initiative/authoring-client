import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';

import ModalSelection from '../selection/ModalSelection';
import { MathEditor } from './MathEditor';

export interface ModalMathEditor {
  currentContent: string;
}

export interface ModalMathEditorProps {
  onInsert: (content: string) => void;
  onCancel: () => void;
  content: string; 
}


export class ModalMathEditor extends React.PureComponent<ModalMathEditorProps, any> {

  constructor(props) {
    super(props);

    this.currentContent = this.props.content;
  }

  render() {
    return (
      <ModalSelection title="Edit Math Expression" onCancel={this.props.onCancel} onInsert={() => this.props.onInsert(this.currentContent)}>
        <MathEditor content={this.props.content} onChange={(content) => this.currentContent = content} />
      </ModalSelection>    
    );
  }

}
