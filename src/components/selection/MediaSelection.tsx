import * as React from 'react';
import guid from '../../utils/guid';
import ModalSelection from './ModalSelection';

type GeneratedIds = {
  input: string,
  help: string 
}

interface MediaSelection {
  data: Object;
  ids: GeneratedIds; 
}

export interface MediaSelectionProps {
  type: string
  onInsert: (type, data) => void;
  onCancel: () => void;
}

class MediaSelection extends React.PureComponent<MediaSelectionProps, {}> {

  constructor(props) {
    super(props);
    this.ids = {
      input: guid(),
      help: guid()
    }
    this.data = { src: '' };
  }

  render() {
    return (
      <ModalSelection title="Select File" onCancel={this.props.onCancel} onInsert={() => this.props.onInsert(this.props.type, this.data)}>
        <form>
          <div className="form-group">
            <label htmlFor={this.ids.input}>Choose a file</label>
            <input type="file" className="form-control" id={this.ids.input} aria-describedby={this.ids.help} />
            <small id={this.ids.help} className="form-text text-muted">Select a file to upload</small>
          </div>
        </form>
      </ModalSelection>    
      );
  }

}

export default MediaSelection;



