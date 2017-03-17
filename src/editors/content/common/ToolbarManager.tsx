import * as React from 'react';
import { SelectionState } from 'draft-js';
import { determineChangeType, SelectionChangeType, hasSelection } from './draft/utils';

const SHIFT = 16;

interface ToolbarManager {
  container: any;
  _onMouseUp: () => void;
  _onMouseDown: () => void; 
  _onKeyDown: () => void;
  _onKeyUp: () => void;
  mouseDown: boolean; 
  shiftPressed: boolean;
  _dismissToolbar: () => void;
}

export interface ToolbarManagerProps {
  inlineToolbar: any;
  blockToolbar: any;
  selectionState: SelectionState;
}

export interface ToolbarManagerState {
  show: boolean;
  component: any;
  x: number;
  y: number;
}

class ToolbarManager extends React.Component<ToolbarManagerProps, ToolbarManagerState> {

  constructor(props) {
    super(props);

    this._dismissToolbar = this.dismissToolbar.bind(this);
    this.mouseDown = false;
    this.shiftPressed = false;

    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);

    this.state = {
      show: false,
      x: null,
      y: null,
      component: null
    }
  
  }

  getPosition() {
    const selection = document.getSelection();
    if (selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const clientRects = range.getClientRects();

    let top = clientRects.item(0);
    for (let i = 0; i < clientRects.length; i++) {
      let c = clientRects.item(i);
      if (c.top < top.top) {
        top = c;
      }
    }

    return top;
  }

  dismissToolbar() {
    this.setState({show: false, x: null, y: null});
  }

  componentWillReceiveProps(nextProps: ToolbarManagerProps) {

    const changeType : SelectionChangeType = determineChangeType(this.props.selectionState, nextProps.selectionState);
    
    if (changeType === SelectionChangeType.Selection) {  
      if (hasSelection(nextProps.selectionState)) {
        const selection = document.getSelection();
        if (selection.rangeCount !== 0) {
          let topRect = this.getPosition();
          if (topRect !== null) {

            const show = !this.mouseDown && !this.shiftPressed;
            this.setState({show, x: topRect.left, y: topRect.top - 20, component: this.props.inlineToolbar});
          } else {
            this.setState({ show: false, x: null, y: null});
          }
        }
      } else {
        this.setState({ show: false, x: null, y: null});
      }
      
      
    } else if (changeType === SelectionChangeType.CursorPosition) {
      this.setState({ show: false, x: null, y: null});
    } 

  }

  onMouseDown() {
    this.mouseDown = true;
    this.setState({show: false});
  }

  onMouseUp() {
    this.mouseDown = false; 
    
    if (this.state.x !== null) {
      this.setState({show: true});
    }
  }

  onKeyDown(e) {
    if (e.keyCode === SHIFT) {
      this.shiftPressed = true;
    }
  }

  onKeyUp(e) {
    if (e.keyCode === SHIFT) {
      this.shiftPressed = false;

      if (this.state.x !== null) {
        this.setState({show: true});
      }
    }
  }

  getXOffset() {
    const position = this.container.getBoundingClientRect();  
    return position.left;
  }

  render() : JSX.Element {

    let toolbarAndContainer = null;
    if (this.state.show) {
      
      const clonedToolbar = React.cloneElement(this.state.component, { dismissToolbar: this._dismissToolbar});
      
      const positionStyle = {
        position: 'absolute',
        top: this.state.y,
        left: this.state.x - this.getXOffset()
      };

      toolbarAndContainer = <div style={positionStyle}>
          {clonedToolbar}
        </div>;
    } 

    return <div ref={(container => this.container = container)} 
            onKeyUp={this._onKeyUp}
            onKeyDown={this._onKeyDown}
            onMouseDown={this._onMouseDown}
            onMouseUp={this._onMouseUp}
            >
            {this.props.children}
            {toolbarAndContainer}
          </div>
  }

}

export default ToolbarManager;
