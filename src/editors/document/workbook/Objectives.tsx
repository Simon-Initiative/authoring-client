import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead, Token, Highlighter } from 'react-bootstrap-typeahead';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import './Objectives.scss';
import { extractFullText } from 'data/content/objectives/objective';

type ObjTitle = { id: string, title: string };

export interface ObjectivesProps extends AbstractContentEditorProps<Immutable.List<string>> {

}

export interface ObjectivesState {
  selected: any;
}

function toObjArray(
  ids: Immutable.List<string>,
  objs: Immutable.OrderedMap<string, contentTypes.LearningObjective>): ObjTitle[] {

  return ids
    .toArray()
    .map(id => ({
      id,
      title: objs.has(id)
        // Support objectives with marked-up content, which is not saved to the title attribute
        ? objs.get(id).rawContent.caseOf({
          just: c => extractFullText(c),
          nothing: () => objs.get(id).title,
        })
        : 'Loading...',
    }));

}

/**
 * Objectives editor
 */
export class Objectives
  extends AbstractContentEditor<Immutable.List<string>, ObjectivesProps, ObjectivesState> {

  constructor(props: ObjectivesProps) {
    super(props);

    this.state = {
      selected: toObjArray(props.model, props.context.objectives),
    };
  }

  componentWillReceiveProps(nextProps: ObjectivesProps) {
    if (nextProps.model !== this.props.model
      || nextProps.context.objectives !== this.props.context.objectives) {

      this.setState({ selected: toObjArray(nextProps.model, nextProps.context.objectives) });
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
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

  renderMain(): JSX.Element {

    const title = o =>
      o.rawContent.caseOf({ just: c => extractFullText(c), nothing: () => o.title });

    const options = this.props.context.objectives
      .toArray()
      .map(o => ({ id: o.id, title: title(o) ? title(o) : 'Loading...' }))
      .sort((a, b) => a.title.trim() < b.title.trim() ? -1 : 1);

    return (
      <div className="objectives-editor">

        <p>Learning Objectives</p>

        <Typeahead
          multiple
          disabled={!this.props.editMode}
          onChange={(selected: ObjTitle[]) => {
            if (selected.length !== this.state.selected.length) {
              const model = Immutable.List(selected.map(s => s.id));
              this.setState({ selected }, () => this.props.onEdit(model));
            }
          }}
          options={options}
          labelKey="title"
          selected={this.state.selected}
          renderMenuItemChildren={(option, props, index) => [
            <Highlighter key="title" search={props.text}>
              {option.title}
            </Highlighter>,
            <div>
              <small>
                Skills: {this.props.context.objectives.get(option.id)
                  ? this.props.context.objectives.get(option.id).skills.size
                  : 0}
              </small>
            </div>,
          ]}
        />
      </div >
    );
  }
}
