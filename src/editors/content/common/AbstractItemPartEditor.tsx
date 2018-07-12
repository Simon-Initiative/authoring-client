import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ParentContainer, TextSelection } from 'types/active';
import { Maybe } from 'tsmonad';

export interface AbstractItemPartEditorProps<ItemType> {

  itemModel: ItemType;

  partModel: contentTypes.Part;

  onEdit: (item: ItemType, part: contentTypes.Part, source: Object) => void;

  context: AppContext;

  services: AppServices;

  editMode: boolean;

  onItemFocus: (itemId: string) => void;

  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;

  onBlur: (itemId: string) => void;

  onRemove: (item: ItemType, part: contentTypes.Part) => void;

  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
}

export interface AbstractItemPartEditorState {


}

/**
 * The abstract content editor.
 */
export abstract class
  AbstractItemPartEditor<ItemType, P extends AbstractItemPartEditorProps<ItemType>,
  S extends AbstractItemPartEditorState>
  extends React.Component<P, S> {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.partModel !== nextProps.partModel
      || this.props.itemModel !== nextProps.itemModel
      || this.props.hover !== nextProps.hover
      || this.props.activeContentGuid !== nextProps.activeContentGuid;
  }

}

