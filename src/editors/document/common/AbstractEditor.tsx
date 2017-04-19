'use strict'

import * as React from 'react';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as types from '../../../data/types';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

export interface AbstractEditor<ModelType, P extends AbstractEditorProps<ModelType>, S extends AbstractEditorState> {
  
}

export interface AbstractEditorProps<ModelType> {

  // The initial document model passed into the editor.
  model: ModelType;

  // Handles edits to the model
  onEdit: (model: ModelType) => void;  

  services: AppServices;

  context: AppContext;
  
  editMode: boolean;

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

