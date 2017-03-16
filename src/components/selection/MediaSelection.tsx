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
      <ModalSelection title="Select URL" onCancel={this.props.onCancel} onInsert={() => this.props.onInsert(this.props.type, this.data)}>
        <form>
          <div className="form-group">
            <label htmlFor={this.ids.input}>Email address</label>
            <input type="email" className="form-control" id={this.ids.input} aria-describedby={this.ids.help} placeholder="Enter URL"/>
            <small id={this.ids.help} className="form-text text-muted">You can use any publicly accessible URL here</small>
          </div>
        </form>
      </ModalSelection>    
      );
  }

}

export default MediaSelection;



