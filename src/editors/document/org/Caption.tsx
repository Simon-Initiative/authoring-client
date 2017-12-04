import * as React from 'react';
import * as Immutable from 'immutable';
import * as t from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import { Maybe } from 'tsmonad';
import { AppServices } from '../../common/AppServices';
import * as models from '../../../data/models';
import guid from '../../../utils/guid';
import { DragHandle } from '../../content/org/drag/DragHandle';
import { DraggableNode } from './DraggableNode';
import { NodeTypes, getExpandId } from './traversal';
import { canHandleDrop } from './utils';
import { Command } from './commands/command';
import { ActionDropdown } from './ActionDropdown';
import { TextInput } from '../../content/common/TextInput';
import { Remove } from './Remove';

import './Caption.scss';

export interface Caption {
  titleInput: any;
  timer: any;
}

export interface CaptionProps {
  labels: t.Labels;
  model: t.Item;
  org: models.OrganizationModel;
  context: AppContext;
  depth: number;
  editMode: boolean;
  isHoveredOver: boolean;
  onEdit: (model: t.Sequence | t.Unit | t.Module | t.Section) => void;
  toggleExpanded: (id) => void;
  processCommand: (command: Command) => void;
  onViewEdit: () => void;
}

export interface CaptionState {
  mouseOver: boolean;

}



export class Caption
  extends React.PureComponent<CaptionProps, CaptionState> {

  constructor(props) {
    super(props);

    this.state = { mouseOver: false };

    this.onViewEdit = this.onViewEdit.bind(this);
  }

  getLabel(contentType: string) {

    if (contentType === 'Item') {
      return 'Resource';
    }

    return this.props.labels[contentType.toLowerCase()];
  }

  onViewEdit() {
    this.props.onViewEdit();
  }

  render() : JSX.Element {

    const { model, depth, editMode } = this.props;

    const buttons = this.props.isHoveredOver
        ? [(
          <button
            onClick={this.onViewEdit}
            type="button"
            className="btn btn-link btn-sm">
            Edit
          </button>
        ), (
          <span className="flex-spacer"/>
        ), (
          <Remove editMode={this.props.editMode} processCommand={this.props.processCommand}/>
        )]
        : null;
    return (
      <div className="caption">
        <button
          className="caption-btn btn btn-link"
          onClick={() => this.props.toggleExpanded(getExpandId(model))}
          type="button">{this.props.children}
        </button>

        {buttons}
      </div>
    );

  }

}

