'use strict'

import * as React from 'react';

import * as models from '../../../data/models';
import { AppServices } from '../../common/AppServices';


export interface AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>, S extends AbstractContentEditorState> {
  
}

export interface AbstractContentEditorProps<ModelType> {

  model: ModelType,

  onEdit: (updated: ModelType) => void;

  userId: string;

  courseId: string;

  documentId: string;

  services: AppServices;

  // Whether or not editing is allowed for this user for this content
  editingAllowed : boolean;

  editMode: boolean;

  onEditModeChange: (blockKey: string, mode: boolean) => void;
}

export interface AbstractContentEditorState {


}

/**
 * The abstract content editor. 
 */
export abstract class AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>, S extends AbstractContentEditorState>
  extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.model !== nextProps.model;
  }

}

