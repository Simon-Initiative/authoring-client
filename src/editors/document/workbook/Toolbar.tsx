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
}


const Separator = (props) => <span>&nbsp;</span>;

const Button = (props) => {
  const { action, icon } = props;
  const iconClasses = 'icon icon-' + icon;
  return (
    <button onClick={() => action()} className="btn btn-sm">
      <i className={iconClasses}></i>
    </button>
  );
}


class Toolbar extends React.PureComponent<ToolbarProps, {}> {

  constructor(props) {
    super(props);

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

  shouldComponentUpdate(nextProps, nextState) {
    return false; 
  }

  toggleInlineStyle(style) {
    this.props.actionHandler.handleAction(toggleInlineStyle(style));
    this.props.dismissToolbar();
  }

  render() {

    return (

      <div className="btn-group">

        <Button action={() => this.toggleInlineStyle('BOLD')} icon="bold"/>
        <Button action={() => this.toggleInlineStyle('ITALIC')} icon="italic"/>
        <Button action={() => this.toggleInlineStyle('UNDERLINE')} icon="underline"/>
        
        <Separator/>

        <Button icon="image"/>
        <Button icon="music"/>
        <Button icon="play"/>
        <Button icon="youtube2"/>
        
        <Separator/>

        <Button action={this.onActivity} icon="cog"/>

      </div>);
  }

}

export default Toolbar;


