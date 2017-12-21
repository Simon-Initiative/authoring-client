import * as React from 'react';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import './markers.scss';

export interface TitleBeginProps extends InteractiveRendererProps {

}

export interface TitleBeginState extends InteractiveRendererState {

}

export interface TitleBegin {

}

export class TitleBegin extends InteractiveRenderer<TitleBeginProps, TitleBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {

    return (
      <span ref={c => this.focusComponent = c} className="TitleSentinel">
        Title&nbsp;
      </span>);
  }
}
