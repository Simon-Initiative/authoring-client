import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { Track }  from '../../../data/content/html/track';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { extractFileName } from './utils';
import { TrackEditor } from './TrackEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface Tracks {
  
}

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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
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

  render() : JSX.Element {

    return (
      <div>
        <span>Tracks</span>
        <button onClick={this.onAddClick} type="button" 
          className="btn btn-secondary btn-sm">Add Track</button>
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

