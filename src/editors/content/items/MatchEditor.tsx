import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

export interface MatchEditorProps
  extends AbstractContentEditorProps<contentTypes.Match> {

}

export interface MatchEditorState {

}

/**
 * The content editor for Table.
 */
export class MatchEditor
  extends AbstractContentEditor<contentTypes.Match,
  MatchEditorProps, MatchEditorState> {

  constructor(props) {
    super(props);

    this.onInputEdit = this.onInputEdit.bind(this);
    this.onMatchEdit = this.onMatchEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onInputEdit(input) {
    this.props.onEdit(this.props.model.with({ input }));
  }

  onMatchEdit(match) {
    this.props.onEdit(this.props.model.with({ match }));
  }

  render() : JSX.Element {

    const { match, input } = this.props.model;

    return (
      <div className="itemWrapper">
        <form className="inline">

          Match:&nbsp;&nbsp;&nbsp;
          <TextInput
            editMode={this.props.editMode}
            width="75px"
            label=""
            value={match}
            type="text"
            onEdit={this.onMatchEdit}
          />

          Input:&nbsp;&nbsp;&nbsp;
          <TextInput
            editMode={this.props.editMode}
            width="75px"
            label=""
            value={input}
            type="text"
            onEdit={this.onInputEdit}
          />

        </form>

      </div>);
  }

}

