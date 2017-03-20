'use strict'

import * as React from 'react';

import { AppServices } from '../../common/AppServices';
import { insertActivity, toggleInlineStyle, AuthoringActionsHandler } from '../../../actions/authoring';
import { titlesForEmbeddedResources } from '../../../data/domain';
import ResourceSelection from '../../../components/selection/ResourceSelection';

interface ToolbarProps {  
  courseId: string; 
  services: AppServices;
  actionHandler: AuthoringActionsHandler;
  dismissToolbar?: () => void;  
}

interface Toolbar {
  onImage: () => void;
  onVideo: () => void;
  onAudio: () => void;
  onYouTube: () => void;
  onActivity: () => void;
  _onBlur: () => void;
  component: any;
}


const Separator = (props) => <span>&nbsp;</span>;

const Button = (props) => {
  const { action, icon } = props;
  const iconClasses = 'icon icon-' + icon;
  const style = {
    color: 'white'
  }
  const buttonStyle = {
    backgroundColor: 'black'
  }
  return (
    <button onClick={() => action()} type="button" className="btn" style={buttonStyle}>
      <i style={style} className={iconClasses}></i>
    </button>
  );
}


class Toolbar extends React.PureComponent<ToolbarProps, {}> {

  constructor(props) {
    super(props);

    this._onBlur = this.onBlur.bind(this);

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

  shouldComponentUpdate(nextProps, nextState) {
    return false; 
  }

  toggleInlineStyle(style) {
    this.props.actionHandler.handleAction(toggleInlineStyle(style));
    this.props.dismissToolbar();
  }

  componentDidMount() {
    this.component.focus();
  }

  render() {
    const style = {
      boxShadow: "5px 5px 5px #888888"
    }
    return (
      <div style={style} ref={(c) => this.component = c} onBlur={this._onBlur} className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
        <div className="btn-group btn-group-sm" role="group" aria-label="First group">
          <Button action={() => this.toggleInlineStyle('BOLD')} icon="bold"/>
          <Button action={() => this.toggleInlineStyle('ITALIC')} icon="italic"/>
          <Button action={() => this.toggleInlineStyle('UNDERLINE')} icon="underline"/>
          <Button action={() => this.toggleInlineStyle('KBD')} icon="terminal"/>
          <Button action={() => this.toggleInlineStyle('CODE')} icon="code"/>
          <Button action={() => this.toggleInlineStyle('UNDERLINE')} icon="list-ol"/>
          <Button action={() => this.toggleInlineStyle('UNDERLINE')} icon="list-ul"/>
          <Button action={() => this.toggleInlineStyle('UNDERLINE')} icon="link"/>
        </div>
        
      </div>);
  }

}

export default Toolbar;


