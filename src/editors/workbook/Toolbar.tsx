'use strict'

import * as React from 'react';
import { connect }  from 'react-redux';
import { returnType } from '../../utils/types';

import { authoringActions } from '../../actions/authoring';
import { modalActions } from '../../actions/modal';

import MediaSelection from '../../components/selection/MediaSelection';

interface ToolbarProps {  
  dispatch: any;
  editDispatch: any;
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

import { bindActionCreators } from "redux";

class Toolbar extends React.PureComponent<ToolbarProps, {}> {

  constructor(props) {
    super(props);

    this.onImage = () => {
        this.props.dispatch(modalActions.display(
            <MediaSelection type='image' onInsert={(type, data) => {
                authoringActions.insertActivity(type, data);
                this.props.dispatch(modalActions.dismiss());
                }} onCancel={modalActions.dismiss}/>
        ));
    };

    this.onVideo = () => {
        this.props.dispatch(modalActions.display(
            <MediaSelection type='video'  onInsert={(type, data) => {
                this.props.editDispatch(authoringActions.insertActivity(type, data));
                this.props.dispatch(modalActions.dismiss());
                }} onCancel={modalActions.dismiss}/>
        ));
    };

    this.onAudio = () => {
        this.props.dispatch(modalActions.display(
            <MediaSelection type='audio' onInsert={(type, data) => {
                this.props.editDispatch(authoringActions.insertActivity(type, data));
                this.props.dispatch(modalActions.dismiss());
                }} onCancel={modalActions.dismiss}/>
        ));
    };

    this.onYouTube = () => {
        this.props.dispatch(modalActions.display(
            <MediaSelection type='youtube' onInsert={(type, data) => {
                this.props.editDispatch(authoringActions.insertActivity(type, data));
                this.props.dispatch(modalActions.dismiss());
                }} onCancel={modalActions.dismiss}/>
        ));
    };

  }

  render() {

    return (

      <div className="btn-group">

        <Button action={() => this.props.editDispatch(
          authoringActions.toggleInlineStyle.bind(this, 'BOLD'))} icon="bold"/>
        <Button action={() => this.props.editDispatch(
          authoringActions.toggleInlineStyle.bind(this, 'ITALIC'))} icon="italic"/>
        <Button action={() => this.props.editDispatch(
          authoringActions.toggleInlineStyle.bind(this, 'UNDERLINE'))} icon="underline"/>
        
        <Separator/>

        <Button action={this.onImage} icon="image"/>
        <Button action={this.onAudio} icon="music"/>
        <Button action={this.onVideo} icon="play"/>
        <Button action={this.onYouTube} icon="youtube2"/>
        
        <Separator/>

        <Button action={this.onActivity} icon="cog"/>

      </div>);
  }

}

export default Toolbar;


