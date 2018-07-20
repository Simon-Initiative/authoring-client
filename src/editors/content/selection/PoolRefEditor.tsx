import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { LegacyTypes } from 'data/types';
import { Resource, ResourceState } from 'data/content/resource';

export interface PoolRefEditor {
  guid: string;
}

export interface PoolRefProps extends AbstractContentEditorProps<contentTypes.PoolRef> {
  onRemove: (guid: string) => void;

}

export interface PoolRefState {
  title: string;
}


/**
 * The content editor for HtmlContent.
 */
export class PoolRefEditor
  extends AbstractContentEditor<contentTypes.PoolRef, PoolRefProps, PoolRefState> {

  constructor(props) {
    super(props);

    this.onInsert = this.onInsert.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onViewPool = this.onViewPool.bind(this);

    this.state = {
      title: null,
    };
  }

  fetchTitlePoolById(id) {

    this.props.services.fetchAttributesBy(['title', 'guid'], 'id', id)
    .then((o) => {
      const { title, guid } = o;
      this.guid = guid;
      this.setState({ title });
    });
  }

  componentDidMount() {
    this.fetchTitlePoolById(this.props.model.idref);
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
    if (nextState.title !== this.state.title) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.model.idref !== nextProps.model.idref) {
      this.fetchTitlePoolById(nextProps.model.idref);
    }
  }

  onCancel() {
    this.props.services.dismissModal();
  }

  onInsert(resource: Resource) {
    this.props.services.dismissModal();

    this.props.services.fetchIdByGuid(resource.guid)
    .then((idref) => {
      this.props.onEdit(this.props.model.with({ idref }));
    });
  }

  onViewPool() {
    if (this.guid !== null) {
      this.props.services.viewDocument(
        this.guid,
        this.props.context.courseId);
    }
  }

  onClick() {

    const predicate = (res: Resource) : boolean =>
      res.type === LegacyTypes.assessment2_pool
        && res.resourceState !== ResourceState.DELETED;

    this.props.services.displayModal(
        <ResourceSelection
          filterPredicate={predicate}
          courseId={this.props.context.courseId}
          onInsert={this.onInsert}
          onCancel={this.onCancel}/>);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    let details;
    if (this.props.model.idref === '') {
      details = 'No external pool selected';
    } else if (this.state.title === null) {
      details = '';
    } else {
      details =
        <span>
          <button onClick={this.onViewPool}
            className="btn btn-link" type="button">{this.state.title}</button>
          <small style={{ paddingLeft: 15 }} className="tab-label">{this.props.model.idref}</small>
        </span>;
    }

    return (
      <ul className="list-group">
        <li style={{ paddingBottom: '0.25rem', width: '84%' }}
          className="list-group-item justify-content-between">
          {details}
          <button disabled={!this.props.editMode} className="btn btn-primary btn-sm"
            onClick={this.onClick} style={{ float: 'right' }} type="button">Select</button>
        </li>
      </ul>
    );
  }

}

