import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ignoredAttributes } from './common';

export interface EntryListProps {
  model: Immutable.List<contentTypes.Entry>;
  onSelectEntry: (entry: contentTypes.Entry) => void;
}

export interface EntryListState {
  selectedEntryId: string;
}

function buildEntryDesc(entry: contentTypes.Entry, index) {

  const attrs = Object.keys((entry as any).toJSON()).filter(key => !ignoredAttributes[key]);

  return index + '. ' + attrs.reduce(
    (p, key) => {
      const value = entry[key];
      if (value === undefined) {
        return p;
      }
      if (key === 'authorEditor') {
        return p + value.first() + '. ';
      }
      if (key === 'volumeNumber') {
        return p + value.caseOf({
          just: v => v.first(),
          nothing: () => '',
        });
      }
      if (typeof value === 'string') {
        return p + value + '. ';
      }
      if (typeof value === 'object' && value.lift !== undefined) {
        return p + value.caseOf({
          just: v => v + '. ',
          nothing: () => '',
        });
      }
      return p;
    },
    '',
  );

}


export default class EntryList
  extends React.Component<EntryListProps, EntryListState> {

  constructor(props) {
    super(props);

    this.state = { selectedEntryId: null };
  }

  handleSelect(entry: contentTypes.Entry, event) {
    event.preventDefault();

    this.setState(
      { selectedEntryId: entry.id },
      () => this.props.onSelectEntry(entry));
  }

  renderItems() {
    const { model } = this.props;

    return model.toArray().map((entry, index) => {
      const active = entry.id === this.state.selectedEntryId
        ? 'active'
        : '';
      return (
        <a
          href="#"
          onClick={e => this.handleSelect(entry, e)}
          className={`list-group-item list-group-item-action ${active}`}>
          {buildEntryDesc(entry, index + 1)}
        </a>
      );
    });
  }

  render() {
    return (
      <div className="list-group">
        {this.renderItems()}
      </div>
    );
  }
}
