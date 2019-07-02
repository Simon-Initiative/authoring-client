import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import './Prerequisites.scss';

type PrereqTitle = { id: string, title: string };

export interface PrerequisitesProps extends AbstractContentEditorProps<Immutable.List<string>> {
  workbookPages: Immutable.OrderedMap<string, any>;
  coursePrereqs: Object;
  coursePostreqs: Object;
}

export interface PrerequisitesState {
  selected: any;
}

function toWbpArray(
  idRefs: Immutable.List<string>,
  wbps: Immutable.OrderedMap<string, any>): Object[] {

  return idRefs
    .toArray()
    .map(id => ({
      id,
      title: wbps.has(id)
        ? wbps.get(id).title
        : 'Loading...',
    }));
}

/**
 * Prerequisites editor
 */
export class Prerequisites
  extends AbstractContentEditor<Immutable.List<string>, PrerequisitesProps, PrerequisitesState> {

  constructor(props: PrerequisitesProps) {
    super(props);

    this.state = {
      selected: toWbpArray(props.model, props.workbookPages),
    };
  }

  componentWillReceiveProps(nextProps: PrerequisitesProps) {
    if (nextProps.model !== this.props.model
      || nextProps.context.courseModel !== this.props.context.courseModel) {

      this.setState({
        selected: toWbpArray(nextProps.model, nextProps.workbookPages),
      });
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
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

  onRenderMenuItemChildren = (pageOption: PrereqTitle, props, index) => {
    const { coursePrereqs, coursePostreqs } = this.props;

    const pageDependencies = coursePrereqs[pageOption.id]
      ? coursePrereqs[pageOption.id].length
      : 0;

    const pageDependents = coursePostreqs[pageOption.id]
      ? coursePostreqs[pageOption.id].length
      : 0;

    const isConnected = pageDependencies > 0 || pageDependents > 0;
    const color = isConnected
      ? '#2ecc71'
      : '#e74c3c';

    return [
      <strong key="name">{pageOption.title}</strong>,
      <div key="email">
        <small>
          Prerequisites: <span>{pageDependencies}</span>
          &nbsp;|
          Postrequisites: <span>{pageDependents}</span>
          {isConnected ? null : <span> | <span style={{ color }}>Disconnected</span></span>}
        </small>
      </div>,
    ];
  }

  renderMain(): JSX.Element {

    const title = page => page.title;

    const options = this.props.workbookPages
      .toArray()
      .map(resource =>
        ({ id: resource.id, title: title(resource) ? title(resource) : 'Loading...' }))
      .sort((a, b) => a.title.trim() < b.title.trim() ? -1 : 1);

    return (
      <div className="prerequisites-editor">

        <p>Learning Prerequisites</p>

        <Typeahead
          multiple
          disabled={!this.props.editMode}
          onChange={(selected: PrereqTitle[]) => {
            if (selected.length !== this.state.selected.length) {
              const model = Immutable.List(selected.map(s => s.id));
              this.setState({ selected }, () => this.props.onEdit(model));
            }
          }}
          options={options}
          labelKey="title"
          selected={this.state.selected}
          renderMenuItemChildren={this.onRenderMenuItemChildren}
        />
      </div >
    );
  }
}
