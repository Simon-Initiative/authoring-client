import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import './Objectives.scss';

type ObjTitle = { id: string, title: string };

export interface ObjectivesProps extends AbstractContentEditorProps<Immutable.List<string>> {

}

export interface ObjectivesState {
  selected: any;
}

function toObjArray(
  ids: Immutable.List<string>,
  objs: Immutable.OrderedMap<string, contentTypes.LearningObjective>) : ObjTitle[] {

  return ids
    .toArray()
    .map(id => ({ id, title: objs.has(id) ? objs.get(id).title : 'Loading...' }));

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
    if (nextProps.model !== this.props.model) {
      this.setState({ selected: toObjArray(nextProps.model, nextProps.context.objectives) });
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context.objectives !== this.props.context.objectives) {
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

  renderMain() : JSX.Element {

    const options = this.props.context.objectives
      .toArray()
      .map(o => ({
        id: o.id,
        title: o.title ? o.title : 'Loading...',
      }));

    return (
      <div className="objectives-editor">

        <p>Objectives that pertain to this page:</p>

        <Typeahead
          multiple
          onChange={(selected: ObjTitle[]) => {

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

