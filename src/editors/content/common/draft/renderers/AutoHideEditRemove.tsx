import * as React from 'react';
import { Button } from '../../Button';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import './AutoHideEditRemove.scss';

export interface AutoHideEditRemoveProps {
}

export interface AutoHideEditRemoveState {
  show: boolean;
}

export interface AutoHideEditRemoveProps {
  onEdit: () => void;
  onRemove: () => void;
  editMode: boolean;
}


class AutoHideEditRemove 
  extends React.PureComponent<AutoHideEditRemoveProps, AutoHideEditRemoveState> {

  constructor(props) {
    super(props);
    
    this.state = { show: false };

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter() {
    this.setState({ show: true });
  }

  onMouseLeave() {
    this.setState({ show: false });
  }

  render() : JSX.Element {

    const buttonDiv : any = {
      position: 'absolute',
      left: 25,
      top: 10,
    };

    const buttons = this.state.show
      ? [
        <button 
          key="editButton"
          disabled={!this.props.editMode} 
          onClick={this.props.onEdit} 
          style={ { marginRight: '5px' } }
          type="button"
          className="animatedButton">Edit</button>,
        <button 
          key="removeButton"
          disabled={!this.props.editMode} 
          onClick={() => setTimeout(() => this.props.onRemove(), 0)} 
          type="button" 
          className="animatedButton">Remove</button>]
      : [];

    const parentDiv : any = {
      position: 'relative',
    };
    
    return (  
      <div style={parentDiv} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        {this.props.children}

        <div style={buttonDiv}>
          <ReactCSSTransitionGroup transitionName="editRemove"
            transitionEnterTimeout={700} transitionLeaveTimeout={50}>
            {buttons}
          </ReactCSSTransitionGroup>  
        </div>
    
      </div>
    );
    
  }
}

export default AutoHideEditRemove;
