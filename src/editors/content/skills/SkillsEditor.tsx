import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Skill } from 'types/course';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import './SkillsEditor.scss';

export interface SkillsEditorProps extends AbstractContentEditorProps<Immutable.Set<string>> {

}

export interface SkillsEditorState {
  selected: Skill[];
}

function toSkillArray(
  ids: Immutable.Set<string>,
  allSkills: Immutable.OrderedMap<string, contentTypes.Skill>): Skill[] {

  return ids
    .toArray()
    .map(id => ({ id, title: allSkills.has(id) ? allSkills.get(id).title : 'Loading...' }));
}

/**
 * Skills editor
 */
export default class SkillsEditor
  extends AbstractContentEditor<Immutable.Set<string>, SkillsEditorProps, SkillsEditorState> {

  constructor(props: SkillsEditorProps) {
    super(props);

    this.state = {
      selected: toSkillArray(props.model, props.context.skills),
    };
  }

  componentWillReceiveProps(nextProps: SkillsEditorProps) {
    if (nextProps.model !== this.props.model ||
      this.props.context.skills !== nextProps.context.skills) {
      this.setState({ selected: toSkillArray(nextProps.model, nextProps.context.skills) });
    }

  }

  shouldComponentUpdate(nextProps: SkillsEditorProps, nextState: SkillsEditorState) {
    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    if (nextState.selected !== this.state.selected) {
      return true;
    }
    return false;
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  handleOnFocus() {
    this.props.onFocus(null, null, Maybe.nothing());
  }

  renderMain(): JSX.Element {
    const options = this.props.context.skills
      .toArray()
      .map(s => ({ id: s.id.value(), title: s.title }));

    return (
      <div className="skills-editor">
        <Typeahead
          multiple
          disabled={!this.props.editMode}
          onChange={(selected: Skill[]) => {
            if (this.state.selected.length !== selected.length) {
              const model = Immutable.Set(selected.map(s => s.id));
              this.setState({ selected }, () => this.props.onEdit(model));
            }
          }}
          options={options}
          labelKey="title"
          selected={this.state.selected}
        />
      </div>
    );

  }

}
