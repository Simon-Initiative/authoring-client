'use strict'

import * as React from 'react';
import { connect }  from 'react-redux';
import { returnType } from '../../utils/types';

import MediaSelection from '../../components/selection/MediaSelection';

function mapStateToProps(state) {  
  const {
    questions, 
  } = state;

  return {
    questions
  }
}

interface ToolbarOwnProps {  
  authoringActions: any;
  modalActions: any;
}

const stateGeneric = returnType(mapStateToProps);  
type ToolbarReduxProps = typeof stateGeneric;  
type ToolbarProps = ToolbarReduxProps & ToolbarOwnProps;


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
        this.props.modalActions.display(
            <MediaSelection type='image' onInsert={(type, data) => {
                this.props.authoringActions.insertActivity(type, data);
                this.props.modalActions.dismiss();
                }} onCancel={this.props.modalActions.dismiss}/>
        )
    };

    this.onVideo = () => {
        this.props.modalActions.display(
            <MediaSelection type='video'  onInsert={(type, data) => {
                this.props.authoringActions.insertActivity(type, data);
                this.props.modalActions.dismiss();
                }} onCancel={this.props.modalActions.dismiss}/>
        )
    };

    this.onAudio = () => {
        this.props.modalActions.display(
            <MediaSelection type='audio' onInsert={(type, data) => {
                this.props.authoringActions.insertActivity(type, data);
                this.props.modalActions.dismiss();
                }} onCancel={this.props.modalActions.dismiss}/>
        )
    };

    this.onYouTube = () => {
        this.props.modalActions.display(
            <MediaSelection type='youtube' onInsert={(type, data) => {
                this.props.authoringActions.insertActivity(type, data);
                this.props.modalActions.dismiss();
                }} onCancel={this.props.modalActions.dismiss}/>
        )
    };

  }

  render() {

    const { authoringActions, modalActions } = this.props;

    return (

      <div className="btn-group">
        <Button action={authoringActions.toggleInlineStyle.bind(this, 'BOLD')} icon="bold"/>
        <Button action={authoringActions.toggleInlineStyle.bind(this, 'ITALIC')} icon="italic"/>
        <Button action={authoringActions.toggleInlineStyle.bind(this, 'UNDERLINE')} icon="underline"/>
        
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

export default connect<ToolbarReduxProps, {}, ToolbarOwnProps>(mapStateToProps)(Toolbar);


