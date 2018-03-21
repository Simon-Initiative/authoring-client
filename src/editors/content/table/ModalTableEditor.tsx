import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { TableEditor } from './TableEditor';
import ModalSelection from '../../../utils/selection/ModalSelection';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

interface ModalTableEditor {

}

export interface ModalTableEditorProps {
  onInsert: (model: contentTypes.Table) => void;
  onCancel: () => void;
  model: contentTypes.Table;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
}

export interface ModalTableEditorState {
  model: contentTypes.Table;
}

class ModalTableEditor extends React.PureComponent<ModalTableEditorProps, ModalTableEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      model: props.model,
    };

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit(model: contentTypes.Table) {
    this.setState({ model });
  }

  render() {

    return (
      <ModalSelection title="Edit Table"
        okLabel="Done" cancelLabel="Cancel"
        onCancel={this.props.onCancel}
        onInsert={() => this.props.onInsert(this.state.model)}>

        <TableEditor
          activeContentGuid={null}
          hover={null}
          onUpdateHover={() => {}}
          onFocus={null}
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          model={this.state.model}
          onEdit={this.onEdit}
        />
      </ModalSelection>
    );
  }

}

export default ModalTableEditor;
