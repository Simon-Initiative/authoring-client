import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Pullout as PulloutType } from 'data/content/learning/pullout';
import { Select, TextInput } from '../common/controls';
import { TitleContentEditor } from 'editors/content/title//TitleContentEditor';

export interface PulloutProps extends AbstractContentEditorProps<PulloutType> {

}

export interface PulloutState {

}

export class Pullout extends AbstractContentEditor<PulloutType, PulloutProps, PulloutState> {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }

  renderSidebar(): JSX.Element {
    return <span>Hey</span>;
  }

  renderToolbar(): JSX.Element {
    return <span>Hey</span>;
  }

  renderMain(): JSX.Element {
    return <span>Hey</span>;
  }
}
