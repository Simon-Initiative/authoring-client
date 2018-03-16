import * as React from 'react';
import * as Immutable from 'immutable';

import { Track } from 'data/content/learning/track';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TrackEditor } from './TrackEditor';

export interface TracksProps
  extends AbstractContentEditorProps<Immutable.OrderedMap<string, Track>> {
  mediaType: string;
  accept: string;
}

export interface TracksState {

}


export class Tracks
  extends AbstractContentEditor<Immutable.OrderedMap<string, Track>, TracksProps, TracksState> {

  constructor(props) {
    super(props);

    this.onAddClick = this.onAddClick.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onEdit = this.onEdit.bind(this);
  }

  onAddClick() {
    const track = new Track();
    this.props.onEdit(this.props.model.set(track.guid, track));
  }

  onRemove(guid) {
    this.props.onEdit(this.props.model.delete(guid));
  }

  onEdit(track) {
    this.props.onEdit(this.props.model.set(track.guid, track));
  }

  renderRows() {
    return this.props.model.toArray().map(track =>
      <TrackEditor
        key={track.guid}
        {...this.props}
        onRemove={this.onRemove}
        model={track}
        onEdit={this.onEdit}
      />);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }
  renderMain() : JSX.Element {

    return (
      <div>
        <button onClick={this.onAddClick} type="button"
          className="btn btn-link btn-sm">Add Track</button>
        <table className="table table-sm">
          <thead>
            <tr>
              <th></th>
              <th>Source</th>
              <th>Kind</th>
              <th>Label</th>
              <th>Language</th>
              <th>Default</th>
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

