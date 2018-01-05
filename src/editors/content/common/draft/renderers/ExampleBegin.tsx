import * as React from 'react';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import './markers.scss';

export interface ExampleBeginProps extends InteractiveRendererProps {

}

export interface ExampleBeginState extends InteractiveRendererState {

}

export interface ExampleBegin {

}

export class ExampleBegin extends InteractiveRenderer<ExampleBeginProps, ExampleBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {

    return (
      <span ref={c => this.focusComponent = c} className="ExampleSentinel">
        Example&nbsp;
      </span>);
  }
}
