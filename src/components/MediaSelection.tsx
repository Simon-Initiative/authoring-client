import * as React from 'react';
import ModalSelection from './ModalSelection';

interface MediaSelection {
  data: Object;
}

export interface MediaSelectionProps {
  type: string
  onInsert: (type, data) => void;
  onCancel: () => void;
}

class MediaSelection extends React.PureComponent<MediaSelectionProps, {}> {

  constructor(props) {
    super(props);

    this.data = { src: '' };
  }

  render() {
    return (
      <ModalSelection title="Select URL" onCancel={this.props.onCancel} onInsert={() => this.props.onInsert(this.props.type, this.data)}>
        <form>
            <div className="form-group">
                <label className="form-label" htmlFor="input-example-1">URL</label>
                <input onChange={e => this.data = {src: e.target.value}} className="form-input" type="text" id="input-example-1" placeholder="URL..." />
            </div>
        </form>
      </ModalSelection>    
      );
  }

}

export default MediaSelection;



