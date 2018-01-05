import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';

export interface AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>,
  S extends AbstractContentEditorState> {}

export interface AbstractContentEditorProps<ModelType> {
  model: ModelType;
  onEdit: (updated: ModelType) => void;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  styles?: any;
}

export interface AbstractContentEditorState {}

/**
 * The abstract content editor.
 */
export abstract class
  AbstractContentEditor
    <ModelType, P extends AbstractContentEditorProps<ModelType>,
    S extends AbstractContentEditorState> extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }

  // Force concrete classes to implement their own logic
  abstract shouldComponentUpdate(nextProps, nextState);

}
