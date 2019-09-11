import * as React from 'react';
import * as Immutable from 'immutable';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { WbDependencies, Resource } from 'data/contentTypes';
import { Dependency } from 'data/content/workbook/dependency';
import './Dependencies.scss';

type PrereqTitle = { id: string, title: string };

export interface Props extends AbstractContentEditorProps<WbDependencies> {
  workbookPages: Immutable.OrderedMap<string, Resource>;
}

export interface State {
  selected: PrereqTitle[];
}

function toWbpArray(dependencies: WbDependencies, wbps: Immutable.OrderedMap<string, any>):
  PrereqTitle[] {

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
    const { model: thisModel, context: thisContext } = this.props;
    const { model: nextModel, context: nextContext } = nextProps;

    if (nextModel !== thisModel || nextContext.courseModel !== thisContext.courseModel) {
      this.setState({
        selected: toWbpArray(nextModel, nextProps.workbookPages),
      });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return nextProps.model !== this.props.model
      || nextProps.context !== this.props.context
      || nextState.selected !== this.state.selected;
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  onRenderMenuItemChildren = (pageOption: PrereqTitle, props: any, index: number) => {
    return [pageOption.title];
  }

  renderMain(): JSX.Element {
    const isNotSelected = (selected: PrereqTitle[], r: Resource) =>
      !selected.map(s => s.id).includes(r.id);

    const options = this.props.workbookPages
      .toArray()
      .filter(resource => isNotSelected(this.state.selected, resource))
      .map(resource => ({
        id: resource.id,
        title: resource.title || 'Loading...',
        dependencies: (resource as any).dependencies,
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
      </div>
    );
  }
}
