import * as React from 'react';
import * as t from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
import { getExpandId } from './traversal';
import { Command } from './commands/command';
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

    this.onClick = this.onClick.bind(this);
  }

  getLabel(contentType: string) {

    if (contentType === 'Item') {
      return 'Resource';
    }

    return this.props.labels[contentType.toLowerCase()];
  }

  onClick(model) {
    this.props.toggleExpanded(getExpandId(model));
    this.props.onViewEdit();
  }

  render(): JSX.Element {

    const { model } = this.props;
    console.log(this.props.context.courseModel.resourcesById.get(model.id));
    console.log(this.props.context.courseModel.resourcesById.get(model.guid));
    console.log(this.props.context.courseModel.resources.get(model.guid));
    console.log(this.props.context.courseModel.resources.get(model.id));
    console.log(model);

    const buttons = this.props.isHoveredOver
      ? [<Remove key="remove" editMode={this.props.editMode}
          processCommand={this.props.processCommand} />]
      : null;
    return (
      <div className="caption">
        <button
          className="caption-btn btn btn-link"
          onClick={() => this.onClick(model)}
          type="button">{this.props.children}
        </button>

        {buttons}
      </div>
    );

  }

}

