import * as React from 'react';
import { Math } from './Math';
import guid from '../../utils/guid'; 

type GeneratedIds = {
  mathEditor: string,
  preview: string
}

export interface MathEditor {
  ids: GeneratedIds
  _onChange: any
}

export interface MathEditorProps {
  content: string;
  onChange: (content: string) => void; 
}

export interface MathEditorState {
  content: string; 
}

export class MathEditor extends React.Component<MathEditorProps, MathEditorState> {

  constructor(props) {
    super(props);
    this.ids = {
      mathEditor: guid(),
      preview: guid()
    }

    this.state = {
      content: this.props.content
    }

    this._onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const content = e.target.value;
    this.setState({content}, () => this.props.onChange(content));
  } 

  render() {
    return (
      <form>
        <div className="form-group">
          <label htmlFor={this.ids.mathEditor}>Edit MathML Expression</label>
          <textarea onChange={this._onChange} className="form-control" id={this.ids.mathEditor} rows={10} value={this.state.content}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor={this.ids.preview}>Preview</label>
          <Math inline>{this.state.content}</Math>
        </div>
        
      </form>
    )
  }
}

