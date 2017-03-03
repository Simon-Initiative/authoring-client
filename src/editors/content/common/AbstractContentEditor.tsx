'use strict'

import * as React from 'react';

import * as models from '../../../data/models';


export interface AbstractContentEditor<P extends AbstractContentEditorProps, S extends AbstractContentEditorState> {
  
}

export interface AbstractContentEditorProps {

  // Whether or not editing is allowed for this user for this content
  editingAllowed : boolean;
  
}

export interface AbstractContentEditorState {


}

/**
 * The abstract content editor. 
 */
export abstract class AbstractContentEditor<P extends AbstractContentEditorProps, S extends AbstractContentEditorState>
  extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }



}

