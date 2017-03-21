'use strict'

import * as React from 'react';

import { AppServices } from '../../common/AppServices';
import { toggleInlineStyle, AuthoringActionsHandler } from '../../../actions/authoring';

interface InlineToolbarProps {  
  courseId: string; 
  services: AppServices;
  actionHandler: AuthoringActionsHandler;
  dismissToolbar?: () => void;  
}

interface InlineToolbar {
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


class InlineToolbar extends React.PureComponent<InlineToolbarProps, {}> {

  constructor(props) {
    super(props);

    this._onBlur = this.onBlur.bind(this);
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

export default InlineToolbar;


