import * as React from 'react';
import { SelectionState } from 'draft-js';
import { determineChangeType, SelectionChangeType } from './draft/utils';

type ToolbarState = {
  show: boolean,
  x: number,
  y: number
};

interface ToolbarManager {
  toolbarTimer: any;
  componentDidUnmount: boolean;
  _dismissToolbar: () => void;
}

export interface ToolbarManagerProps {
  toolbar: any;
  selectionState: SelectionState;
  
}

export interface ToolbarManagerState {
  toolbar: ToolbarState
}

class ToolbarManager extends React.Component<ToolbarManagerProps, ToolbarManagerState> {

  constructor(props) {
    super(props);

    this.toolbarTimer = null;
    this.componentDidUnmount = false;
    this._dismissToolbar = this.dismissToolbar.bind(this);

    this.state = {
      toolbar: {
        show: false,
        x: null,
        y: null
      }
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

  componentWillReceiveProps(nextProps: ToolbarManagerProps) {

    const changeType : SelectionChangeType = determineChangeType(this.props.selectionState, nextProps.selectionState);
    
    if (changeType === SelectionChangeType.Selection) {
      const selection = document.getSelection();
      if (selection.rangeCount !== 0) {
        let topRect = this.getPosition();
        this.setState({ toolbar: {show: true, x: topRect.left, y: topRect.top - 20}});
      }
    } else if (changeType === SelectionChangeType.CursorPosition) {
      this.setState({ toolbar: { show: false, x: null, y: null}});
    } 

  }

  dismissToolbar() {
    this.setState({ 
      toolbar: {
        show: false,
        x: 0,
        y: 0
      }
    });
  }

  showToolbar(coords) {
    if (!this.componentDidUnmount) {
      this.setState({ 
        toolbar: {
          show: true,
          x: coords.x,
          y: coords.y
        }
      });
    }
    
  }

  onMouseDown(e) {
    // const coords = {
    //   x: e.clientX,
    //   y: e.clientY
    // }
    // if (this.toolbarTimer === null) {
    //   this.toolbarTimer = setTimeout(() => {
    //     this.toolbarTimer = null;
    //     this.showToolbar(coords);
    //   }, 500);
    // }
  }

  onMouseUp() {
    if (this.toolbarTimer !== null) {
      clearTimeout(this.toolbarTimer);
      this.toolbarTimer = null;
    }
  }

  componentWillUnmount() {
    this.componentDidUnmount = true;
  }

  render() : JSX.Element {

    let toolbarAndContainer = null;
    if (this.state.toolbar.show) {
      
      const clonedToolbar = React.cloneElement(this.props.toolbar, { dismissToolbar: this._dismissToolbar});
      
      const positionStyle = {
        position: 'absolute',
        top: this.state.toolbar.y,
        left: this.state.toolbar.x
      };

      toolbarAndContainer = <div style={positionStyle}>
          {clonedToolbar}
        </div>;
    } 

    return <div 
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}>
            {this.props.children}
            {toolbarAndContainer}
          </div>
  }

}

export default ToolbarManager;
