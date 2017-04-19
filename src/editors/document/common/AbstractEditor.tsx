'use strict'

import * as React from 'react';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as types from '../../../data/types';
import { AppServices } from '../../common/AppServices';
import { TitleOracle } from '../../common/TitleOracle';

export interface AbstractEditor<ModelType, P extends AbstractEditorProps<ModelType>, S extends AbstractEditorState> {
  
}

export interface AbstractEditorProps<ModelType> {

  // Id of the current user
  userId: string;

  // The initial document model passed into the editor.
  model: ModelType;

  // The document id that the model pertains to. 
  documentId: types.DocumentId;

  onEdit: (model: ModelType) => void;  

  editingAllowed : boolean;

  services: AppServices;

  onEditModeChange: (blockKey: string, mode: boolean) => void;

  editMode: boolean;

  titleOracle: TitleOracle;
}

export interface AbstractEditorState {
  
}

/**
 * An abstract editor that provides the basis for reusable 
 * persistence and undo/redo. 
 */
export abstract class AbstractEditor<ModelType, 
  P extends AbstractEditorProps<ModelType>, S extends AbstractEditorState>
  extends React.Component<P, S> {

}

