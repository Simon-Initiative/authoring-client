import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import './Dependencies.scss';
import { WbDependencies } from 'data/contentTypes';
import { Dependency } from 'data/content/workbook/dependency';

type PrereqTitle = { id: string, title: string };

export interface Props extends AbstractContentEditorProps<WbDependencies> {
  workbookPages: Immutable.OrderedMap<string, any>;
  // workbook page id to ids of pages that it depends on
  // courseDependencies: Immutable.Map<string, Immutable.List<string>>;
  // workbook page id to ids of pages that depend on it
  // courseDependents: Immutable.Map<string, Immutable.List<string>>;
}

export interface State {
  selected: any;
}

function toWbpArray(
  dependencies: WbDependencies,
  wbps: Immutable.OrderedMap<string, any>): Object[] {

  return dependencies.dependencies
    .toArray()
    .map(dependency => ({
      id: dependency.idref,
      title: wbps.has(dependency.idref)
        ? wbps.get(dependency.idref).title
        : 'Loading...',
    }));
}

export class Dependencies extends AbstractContentEditor<WbDependencies, Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selected: toWbpArray(props.model, props.workbookPages),
    };
  }

  componentWillReceiveProps(nextProps: Props) {
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
    // const { courseDependencies, courseDependents } = this.props;

    // const pageDependencies = courseDependencies.get(pageOption.id, Immutable.List()).size;
    // const pageDependents = courseDependents.get(pageOption.id, Immutable.List()).size;

    // const isConnected = pageDependencies > 0 || pageDependents > 0;
    // const color = isConnected ? '#2ecc71' : '#e74c3c';

    return [
      <strong key="name">{pageOption.title}</strong>,
      <div key="email">
        <small>
          {/* Dependencies: <span>{pageDependencies}</span> */}
          {/* {' | '}
          Dependents: <span>{pageDependents}</span>
          {isConnected && <span> | <span style={{ color }}>Disconnected</span></span>} */}
        </small>
      </div>,
    ];
  }

  renderMain(): JSX.Element {

    const options = this.props.workbookPages
      .toArray()
      .map(resource => ({
        id: resource.id,
        title: resource.title || 'Loading...',
        dependencies: resource.dependencies,
      }))
      .sort((a, b) => a.title.trim() < b.title.trim() ? -1 : 1);

    return (
      <div className="dependencies-editor">

        <p>Learning Dependencies</p>

        <Typeahead
          multiple
          disabled={!this.props.editMode}
          onChange={(selected: PrereqTitle[]) => {
            if (selected.length !== this.state.selected.length) {
              this.setState(
                { selected },
                () => this.props.onEdit(this.props.model.with({
                  dependencies: Immutable.OrderedMap(
                    selected
                      .map(s => new Dependency({ idref: s.id }))
                      .map(dependency => [dependency.guid, dependency]),
                  ),
                })));
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
