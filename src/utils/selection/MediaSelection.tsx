import * as React from 'react';
import guid from '../../utils/guid';
import ModalSelection from './ModalSelection';

type GeneratedIds = {
  input: string,
  help: string, 
};

interface MediaSelection {
  file: Object;
  ids: GeneratedIds; 
  _onChange: any;
}

export interface MediaSelectionProps {
  type: string;
  accept: string;  // Media type to allow selection of 
  onInsert: (type, data) => void;
  onCancel: () => void;
}

class MediaSelection extends React.PureComponent<MediaSelectionProps, {}> {

  constructor(props) {
    super(props);
    this.ids = {
      input: guid(),
      help: guid(),
    };
    this.file = null;
    this._onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.file = e.target.files[0];
  }

  render() {
    return (
      <ModalSelection title="Select File" 
        onCancel={this.props.onCancel} 
        onInsert={() => this.props.onInsert(this.props.type, this.file)}>
        <form>
          <div className="form-group">
            <label htmlFor={this.ids.input}>Choose a file</label>
            <input 
              accept={this.props.accept}
              onChange={this._onChange} 
              type="file" 
              className="form-control" 
              id={this.ids.input} 
              aria-describedby={this.ids.help} />
            <small id={this.ids.help} 
              className="form-text text-muted">Select a file to upload</small>
          </div>
        </form>
      </ModalSelection>    
    );
  }

}

export default MediaSelection;



