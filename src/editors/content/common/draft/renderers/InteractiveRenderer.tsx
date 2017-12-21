import * as React from 'react';
import { BlockProps } from './properties';
import { ContentState, ContentBlock } from 'draft-js';

export interface InteractiveRendererProps {
  blockProps: BlockProps;
  contentState: ContentState;
  block: ContentBlock;
}

export interface InteractiveRendererState {
  editMode: boolean;
}

export interface InteractiveRenderer<P extends InteractiveRendererProps, S extends InteractiveRendererState> {
  focusComponent: any;
}

export abstract class InteractiveRenderer<P extends InteractiveRendererProps, S extends InteractiveRendererState> extends React.Component<P, S> {

  constructor(props, childState) {
    super(props);

    this.state = (Object.assign({}, { 
      editMode: false,   
    },                          childState) as S);

    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.focusComponent = null;
  }


  onBlur(e) {

    if (this.state.editMode) {

      const currentTarget = e.currentTarget;

      setTimeout(() => {
        if (!currentTarget.contains(document.activeElement)) {
          this.setState({ editMode: false });
          this.props.blockProps.onLockChange(false);
        }
      },         0);
    
    }
  }

  onFocus() {
    if (!this.state.editMode) {
      this.setState({ editMode: true }, () => this.focusComponent.focus());
      this.props.blockProps.onLockChange(true);
    }
  }

}
