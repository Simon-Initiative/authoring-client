import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Skill } from 'types/course';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor,
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { TextInput, InlineForm, Button, Checkbox } from 'editors/content/common/controls';

import './ConceptsEditor.scss';

export interface ConceptsEditorProps extends AbstractContentEditorProps<Immutable.List<string>> {

}

export interface ConceptstEditorState {
  selected: any;
}

function toSkillArray(
  ids: Immutable.List<string>,
  allSkills: Immutable.OrderedMap<string, contentTypes.Skill>) : Skill[] {

  return ids
    .toArray()
    .map(id => ({ id, title: allSkills.has(id) ? allSkills.get(id).title : 'Loading...' }));
}

/**
 * Concepts editor
 */
export default class ConceptsEditor
  extends AbstractContentEditor<Immutable.List<string>, ConceptsEditorProps, ConceptstEditorState> {

  constructor(props: ConceptsEditorProps) {
    super(props);

    this.state = {
      selected: toSkillArray(props.model, props.context.skills),
    };
  }

  componentWillReceiveProps(nextProps: ConceptsEditorProps) {
    if (nextProps.model !== this.props.model) {
      this.setState({ selected: toSkillArray(nextProps.model, nextProps.context.skills) });
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context.skills !== this.props.context.skills) {
      return true;
    }
    if (nextState.selected !== this.state.selected) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {

    const skills = this.props.model.toArray();

    const options = this.props.context.skills
      .toArray()
      .map(s => ({ id: s.id, title: s.title }));

    return (
      <div className="concepts-editor">
        <Typeahead
          multiple
          onChange={(selected: Skill[]) => {

            const model = Immutable.List(selected.map(s => s.id));
            this.setState({ selected }, () => this.props.onEdit(model));
          }}
          options={options}
          labelKey="title"
          selected={this.state.selected}
        />
      </div>
    );

  }


}

