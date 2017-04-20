import * as React from 'react';

import { AppServices } from '../../../common/AppServices';
import { AppContext } from '../../../common/AppContext';
import { toggleInlineStyle, toggleBlockType, insertAtomicBlock, insertInlineEntity, AuthoringActionsHandler } from '../../../../actions/authoring';
import { EntityTypes } from '../../../../data/content/html/common';

import * as handlers from './handlers';

export interface ToolbarActionProvider {
  toggleInlineStyle: (style: string) => void;
  toggleBlockType: (type: string) => void;
  insertInlineEntity: (entityType: EntityTypes, mutability: string, data: any) => void;
  insertAtomicBlock: (entityType: EntityTypes, data: any) => void;
  insertAudio: () => void;
  insertVideo: () => void;
  insertImage: () => void;
}

export interface ToolbarProps {  
  context: AppContext; 
  services: AppServices;
  actionHandler: AuthoringActionsHandler;
  dismissToolbar?: () => void;  
}

export interface Toolbar {
  _onBlur: () => void;
  component: any;
  insertAudio: () => void;
  insertVideo: () => void;
  insertImage: () => void;
}

const formula = "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mo>&sum;</mo></math>"
const defaultFormula = { '#cdata': formula};

export class Toolbar extends React.PureComponent<ToolbarProps, {}> {

  constructor(props) {
    super(props);

    this._onBlur = this.onBlur.bind(this);

    this.insertAudio = handlers.insertAudio.bind(this, this.props.context, this.props.services, this.props.dismissToolbar, this.props.actionHandler);
    this.insertVideo = handlers.insertVideo.bind(this, this.props.context, this.props.services, this.props.dismissToolbar, this.props.actionHandler);
    this.insertImage = handlers.insertImage.bind(this, this.props.context, this.props.services, this.props.dismissToolbar, this.props.actionHandler);
    
  }

  onBlur() {
    this.props.dismissToolbar();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false; 
  }

  toggleInlineStyle(style) {
    this.props.actionHandler.handleAction(toggleInlineStyle(style));
    this.props.dismissToolbar();
  }

  insertInlineEntity(entityType: EntityTypes, mutability, data) {
    this.props.actionHandler.handleAction(insertInlineEntity(entityType, mutability, data));
    this.props.dismissToolbar();
  }

  insertAtomicBlock(entityType: EntityTypes, data) {
    this.props.actionHandler.handleAction(
          insertAtomicBlock(entityType, data));
    this.props.dismissToolbar();
  }

  toggleBlockType(type) {
    this.props.actionHandler.handleAction(toggleBlockType(type));
    this.props.dismissToolbar();
  }

  componentDidMount() {
    this.component.focus();
  }

  renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child as any, { provider: this });
    });
  }

  render() {
    const style = {
      boxShadow: "5px 5px 5px #888888"
    }
    return (
      <div style={style} ref={(c) => this.component = c} onBlur={this._onBlur} className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
        <div className="btn-group btn-group-sm" role="group" aria-label="First group">
          {this.renderChildren()}
        </div>
      </div>);
  }

}
