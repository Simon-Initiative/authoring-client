'use strict'

import * as React from 'react';

import { AppServices } from '../../common/AppServices';
import { insertActivity, toggleBlockType, AuthoringActionsHandler } from '../../../actions/authoring';
import { titlesForEmbeddedResources } from '../../../data/domain';
import ResourceSelection from '../../../components/selection/ResourceSelection';

interface BlockToolbarProps {  
  courseId: string; 
  services: AppServices;
  actionHandler: AuthoringActionsHandler;
  dismissToolbar?: () => void;  
}

interface BlockToolbar {
  onImage: () => void;
  onVideo: () => void;
  onAudio: () => void;
  onYouTube: () => void;
  onActivity: () => void;
  _onBlur: () => void;
  component: any;
}

interface BlockToolbarState {
  collapsed: boolean;
}


const Separator = (props) => <span>&nbsp;</span>;

const Button = (props) => {
  const { action, icon } = props;
  const iconClasses = 'icon icon-' + icon;
  const style = {
    color: 'white'
  }
  const buttonStyle = {
    backgroundColor: 'black',
    visibility: props.hidden === true ? 'hidden' : 'visible'
  }
  return (
    <button onClick={() => action()} type="button" className="btn" style={buttonStyle}>
      <i style={style} className={iconClasses}></i>
    </button>
  );
}


class BlockToolbar extends React.PureComponent<BlockToolbarProps, BlockToolbarState> {

  constructor(props) {
    super(props);

    this._onBlur = this.onBlur.bind(this);

    this.state = {
      collapsed: false
    };

    this.onActivity = () => {
        this.props.services.displayModal(
            <ResourceSelection
              query={titlesForEmbeddedResources(this.props.courseId)}
              onInsert={(resource) => {
                const data = {
                  id: resource.id
                };
                this.props.actionHandler.handleAction(insertActivity('document', data));
                this.props.services.dismissModal();
                this.props.dismissToolbar();
              }} 
              onCancel={() => {
                this.props.services.dismissModal();
                this.props.dismissToolbar();
              }}/>
        );
    };

  }

  onBlur() {
    this.props.dismissToolbar();
  }

  toggleBlockType(type) {
    this.props.actionHandler.handleAction(toggleBlockType(type));
    this.props.dismissToolbar();
  }

  

  componentDidMount() {
    this.component.focus();
  }

  renderExpandedButtons() {
    return [
      <Button hidden={this.state.collapsed} key="code" action={() => this.props.actionHandler.handleAction(insertActivity('codeblock', {src: 'Testing\nTesting\nAgain'}))} icon="code"/>,
      <Button hidden={this.state.collapsed} key="list-ul" action={() => this.toggleBlockType('unordered-list-item')} icon="list-ul"/>,
      <Button hidden={this.state.collapsed} key="list-ol" action={() => this.toggleBlockType('ordered-list-item')} icon="list-ol"/>
    ];
  }

  render() {
    const style = {
      boxShadow: "5px 5px 5px #888888",
      width: "100%"
    }

    const buttons = this.renderExpandedButtons();

    return (
      <div ref={(c) => this.component = c} onBlur={this._onBlur}>
      <div style={style}  className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
        <div className="btn-group btn-group-sm" role="group" aria-label="First group">
        <Button action={() => this.setState({collapsed: !this.state.collapsed}, this.component.focus())} icon="plus"/>
        {buttons}
        </div>
      </div>
      </div> );
  }

}

export default BlockToolbar;


