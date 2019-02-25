import * as React from 'react';
import * as t from '../../../data/contentTypes';
import { AppContext } from '../../common/AppContext';
import * as models from '../../../data/models';
import { getExpandId } from './traversal';
import { Command } from './commands/command';

import './Caption.scss';

export interface Caption {
  titleInput: any;
  timer: any;
}

export interface CaptionProps {
  model: t.Sequence | t.Unit | t.Module | t.Section | t.Include | t.Item;
  org: models.OrganizationModel;
  context: AppContext;
  depth: number;
  editMode: boolean;
  isHoveredOver: boolean;
  isSelected: boolean;
  toggleExpanded: (id) => void;
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

    return this.props.org.labels[contentType.toLowerCase()];
  }

  onClick(model) {
    this.props.toggleExpanded(getExpandId(model));
    this.props.onViewEdit();
  }

  render(): JSX.Element {

    return (
      <div className="caption">
        {this.props.children}
      </div>
    );

  }

}

