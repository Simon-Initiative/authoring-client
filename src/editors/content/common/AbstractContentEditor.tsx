'use strict'

import * as React from 'react';

import * as models from '../../../data/models';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import { TitleOracle } from '../../common/TitleOracle';

export interface AbstractContentEditor<ModelType, P extends AbstractContentEditorProps<ModelType>, S extends AbstractContentEditorState> {
  
}

export interface AbstractContentEditorProps<ModelType> {

  model: ModelType,

  onEdit: (updated: ModelType) => void;

  context: AppContext;

  services: AppServices;

  editMode: boolean;
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

  // Force concrete classes to implement their own logic
  abstract shouldComponentUpdate(nextProps, nextState);

}

