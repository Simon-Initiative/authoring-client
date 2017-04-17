'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';


export interface ConceptsEditor {
  _onChange: (e: any) => void;
}

export interface ConceptsEditorProps extends AbstractContentEditorProps<Immutable.List<string>> {

  // Initial content to display
  content: Immutable.List<string>;

  onEdit: (newContent: Immutable.List<string>) => void;

}

export interface ConceptstEditorState {

}

/**
 * Concepts editor 
 */
export class ConceptsEditor extends AbstractContentEditor<Immutable.List<string>, ConceptsEditorProps, ConceptstEditorState> {

  constructor(props) {
    super(props);

    this._onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.onEdit(this.props.content);
  }

  render() : JSX.Element {
    
    return null;
  
  }

}

