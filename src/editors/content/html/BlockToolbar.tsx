'use strict'

import * as React from 'react';

import { AppServices } from '../../common/AppServices';
import { insertActivity, toggleBlockType, AuthoringActionsHandler } from '../../../actions/authoring';
import { titlesForEmbeddedResources } from '../../../data/domain';
import ResourceSelection from '../../../utils/selection/ResourceSelection';
import MediaSelection from '../../../utils/selection/MediaSelection';
import { createAttachment } from '../../../utils/selection/upload';
import { fileToBase64 } from '../../../utils/file';

interface BlockToolbarProps {  
  courseId: string; 
  documentId: string; 
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

    this.onImage = this.insertMedia.bind(this, 'image', 'image/*');
    this.onVideo = this.insertMedia.bind(this, 'video', 'video/*');
    this.onAudio = this.insertMedia.bind(this, 'audio', 'audio/*');

  }

  insertMedia(mediaType : string, accept : string) {
    this.props.services.displayModal(
        <MediaSelection
          accept={accept}
          type={mediaType}
          onInsert={(type, file) => {

            fileToBase64(file)
            .then(base64data => createAttachment(file.name, base64data, file.type, this.props.documentId))
            .then(src =>  {

              const data = {src};     
              this.props.actionHandler.handleAction(
                insertActivity(mediaType, data));

              this.props.services.dismissModal();
              this.props.dismissToolbar();
            })
            .catch(err => {
              this.props.services.dismissModal();
              this.props.dismissToolbar();
            });
            
          }} 
          onCancel={() => {
            this.props.services.dismissModal();
            this.props.dismissToolbar();
          }}/>
    );
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
      <Button hidden={this.state.collapsed} key="code" 
        action={() => this.props.actionHandler.handleAction(
          insertActivity('codeblock', {src: 'Your code here...'}))} 
        icon="code"/>,
      <Button hidden={this.state.collapsed} key="image" 
        action={this.onImage} 
        icon="image"/>,
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


