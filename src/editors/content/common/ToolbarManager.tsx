import * as React from 'react';


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
    const coords = {
      x: e.clientX,
      y: e.clientY
    }
    if (this.toolbarTimer === null) {
      this.toolbarTimer = setTimeout(() => {
        this.toolbarTimer = null;
        this.showToolbar(coords);
      }, 500);
    }
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
