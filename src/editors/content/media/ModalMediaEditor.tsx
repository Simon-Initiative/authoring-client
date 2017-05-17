import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import ModalSelection from '../../../utils/selection/ModalSelection';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

interface ModalMediaEditor {
  
}

export interface ModalMediaEditorProps {
  onInsert: (model: contentTypes.Table) => void;
  onCancel: () => void;
  model: any;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
}

export interface ModalMediaEditorState {
  model: any;
}

class ModalMediaEditor extends React.PureComponent<ModalMediaEditorProps, ModalMediaEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      model: props.model,
    };

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit(model: any) {
    this.setState({ model });
  }

  renderChildren() {
    const additionalProps = {
      model: this.state.model,
      onEdit: this.onEdit,
    };
    return React.Children.map(
      this.props.children,
      (c) => {
        return React.cloneElement(c as any, additionalProps);
      });
  }

  render() {

    return (
      <ModalSelection title="Edit" 
        okLabel="Done" cancelLabel="Cancel"
        onCancel={this.props.onCancel} 
        onInsert={() => this.props.onInsert(this.state.model)}>
        
        {this.renderChildren()}
        
      </ModalSelection>    
    );
  }

}

export default ModalMediaEditor;
