import * as React from 'react';
import {
  InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
} from './InteractiveRenderer';
import './markers.scss';

export interface TranslationBeginProps extends InteractiveRendererProps {

}

export interface TranslationBeginState extends InteractiveRendererState {

}

export interface TranslationBegin {

}

export class TranslationBegin
  extends InteractiveRenderer<TranslationBeginProps, TranslationBeginState> {

  constructor(props) {
    super(props, {});
  }

  render() {

    return (
      <span ref={c => this.focusComponent = c} className="TranslationSentinel">
        Translation&nbsp;
      </span>);
  }
}
