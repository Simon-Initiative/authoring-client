import * as React from 'react';
import { SelectionState } from 'draft-js';
import { determineChangeType, SelectionChangeType } from './draft/utils';

interface ToolbarManager {
  container: any;
  _onMouseUp: () => void;
  _onMouseDown: () => void; 
  mouseDown: boolean; 
  _dismissToolbar: () => void;
}

export interface ToolbarManagerProps {
  toolbar: any;
  selectionState: SelectionState;

}

export interface ToolbarManagerState {
  show: boolean;
  x: number;
  y: number;
}

class ToolbarManager extends React.Component<ToolbarManagerProps, ToolbarManagerState> {

  constructor(props) {
    super(props);

    this._dismissToolbar = this.dismissToolbar.bind(this);
    this.mouseDown = false;

    this.state = {
      show: false,
      x: null,
      y: null
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
    console.log('change: ' + changeType);
    if (changeType === SelectionChangeType.Selection) {
      const selection = document.getSelection();
      if (selection.rangeCount !== 0) {
        let topRect = this.getPosition();
        if (topRect !== null) {
          console.log('props: ' + this.mouseDown);
          this.setState({show: !this.mouseDown, x: topRect.left, y: topRect.top - 20});
        } else {
          this.setState({ show: false, x: null, y: null});
        }
        
      }
    } else if (changeType === SelectionChangeType.CursorPosition) {
      this.setState({ show: false, x: null, y: null});
    } 

  }

  onMouseDown() {
    this.mouseDown = true;
    console.log('mouse down');

    this.setState({show: false});
  }

  onMouseUp() {
    this.mouseDown = false; 
    console.log('mouse up');
    
    if (this.state.x !== null) {
      this.setState({show: true});
    }
  }

  getXOffset() {
    const position = this.container.getBoundingClientRect();  
    return position.left;
  }

  render() : JSX.Element {

    let toolbarAndContainer = null;
    if (this.state.show) {
      
      const clonedToolbar = React.cloneElement(this.props.toolbar, { dismissToolbar: this._dismissToolbar});
      
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
            onMouseDown={this._onMouseDown}
            onMouseUp={this._onMouseUp}
            >
            {this.props.children}
            {toolbarAndContainer}
          </div>
  }

}

export default ToolbarManager;
