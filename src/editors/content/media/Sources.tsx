import * as React from 'react';
import * as Immutable from 'immutable';

import { Source } from '../../../data/content/learning/source';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SourceEditor } from './SourceEditor';

export interface SourcesProps
  extends AbstractContentEditorProps<Immutable.OrderedMap<string, Source>> {
  mediaType: string;
  accept: string;
}

export interface SourcesState {

}


export class Sources
  extends AbstractContentEditor<Immutable.OrderedMap<string, Source>, SourcesProps, SourcesState> {

  constructor(props) {
    super(props);

    this.onAddClick = this.onAddClick.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onEdit = this.onEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onAddClick() {
    const source = new Source();
    this.props.onEdit(this.props.model.set(source.guid, source));
  }

  onRemove(guid) {
    this.props.onEdit(this.props.model.delete(guid));
  }

  onEdit(source) {
    this.props.onEdit(this.props.model.set(source.guid, source));
  }

  renderRows() {
    return this.props.model.toArray().map(source =>
      <SourceEditor
        key={source.guid}
        {...this.props}
        onRemove={this.onRemove}
        model={source}
        onEdit={this.onEdit}
      />);
  }

  render() : JSX.Element {

    return (
      <div>
        <button onClick={this.onAddClick} type="button"
          className="btn btn-link btn-sm">Add Source</button>
        <table className="table table-sm">
          <thead>
            <tr>
              <th></th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.renderRows()}
          </tbody>
        </table>
      </div>
    );
  }

}

