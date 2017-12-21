import * as React from 'react';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';

import './markers.scss';

export interface MaterialBeginProps extends InteractiveRendererProps {

}

export interface MaterialBeginState extends InteractiveRendererState {

}

export interface MaterialBegin {

}

export class MaterialBegin extends InteractiveRenderer<MaterialBeginProps, MaterialBeginState> {

  constructor(props) {
    super(props, {});

  }

  render() {

    return (
      <span ref={c => this.focusComponent = c} className="MaterialSentinel">
        Material&nbsp;
      </span>);
  }
}
