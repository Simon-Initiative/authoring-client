'use strict'

import * as React from 'react';

import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

export interface AbstractItemPartEditor<ItemType, P extends AbstractItemPartEditorProps<ItemType>, S extends AbstractItemPartEditorState> {
  
}

export interface AbstractItemPartEditorProps<ItemType> {

  itemModel: ItemType;

  partModel: contentTypes.Part;

  onEdit: (item: ItemType, part: contentTypes.Part) => void;

  context: AppContext;
  
  services: AppServices;
  
  editMode: boolean;

  onFocus: (itemId: string) => void;

  onBlur: (itemId: string) => void;
  
}

export interface AbstractItemPartEditorState {


}

/**
 * The abstract content editor. 
 */
export abstract class AbstractItemPartEditor<ItemType, P extends AbstractItemPartEditorProps<ItemType>, S extends AbstractItemPartEditorState>
  extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.partModel !== nextProps.partModel
      || this.props.itemModel !== nextProps.itemModel;
  }

}

