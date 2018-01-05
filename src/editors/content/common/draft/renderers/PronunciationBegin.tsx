import * as React from 'react';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import './markers.scss';

export interface PronunciationBeginProps extends InteractiveRendererProps {

}

export interface PronunciationBeginState extends InteractiveRendererState {

}

export interface PronunciationBegin {

}

export class PronunciationBegin
  extends InteractiveRenderer<PronunciationBeginProps, PronunciationBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {

    return (
      <span ref={c => this.focusComponent = c} className="PronunciationSentinel">
        Pronunciation&nbsp;
      </span>);
  }
}
