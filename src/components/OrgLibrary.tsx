

import { Resource, ResourceState } from 'data/content/resource';
import * as models from 'data/models';
import * as React from 'react';
import { relativeToNow } from 'utils/date';
import { LegacyTypes } from 'data/types';
import './ResourceView.scss';

export interface OrgLibraryProps {
  course: models.CourseModel;
  currentOrg: Resource;
  onCreateOrg: (title: string) => void;
  onSelectOrg: (id: string) => void;
}

interface OrgLibraryState {
  newItemTitle: string;
}

export default class OrgLibrary extends React.Component<OrgLibraryProps, OrgLibraryState> {

  state = {
    ...this.state,
    newItemTitle: '',
  };


  getOrgs(): Resource[] {
    const { course } = this.props;

    return course.resources.toArray().filter(r =>
      r.resourceState !== ResourceState.DELETED
      && r.type === LegacyTypes.organization,
    );
  }

  onNewItemTitleChange = (newItemTitle: string) => {
    this.setState({
      newItemTitle,
    });
  }

  renderCreation() {
    const { course } = this.props;
    const { newItemTitle } = this.state;

    return (
      <div className="table-toolbar">
        <div className="input-group">
          <div className="flex-spacer" />
          <div className="btn-group">
            <input type="text"
              style={{ width: 300 }}
              value={newItemTitle}
              disabled={!course.editable}
              className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
              onChange={({ target: { value } }) => this.setState({ newItemTitle: value })}
              placeholder="Enter title for new organization" />
            <button
              disabled={!course.editable || !newItemTitle}
              onClick={() => this.props.onCreateOrg(newItemTitle)}
              className="btn btn-primary">
              Create New
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderResources() {

    const items = this.getOrgs().map((org) => {

      const currentOrgId = this.props.currentOrg !== null
        ? this.props.currentOrg.id
        : null;

      const thisId = org.id;
      const active = thisId === currentOrgId
        ? <small><b><span style={{ color: 'darkgreen' }}>
          Active organization</span></b></small>
        : <small>&nbsp;</small>;
      const classes
        = 'list-group-item list-group-item-action align-items-start flex-column';
      const since = relativeToNow(org.dateUpdated);

      const onClick = (e) => { e.preventDefault(); this.props.onSelectOrg(thisId); };

      return (
        <li
          key={org.id}
          className={classes}>
          <div
            className="d-flex w-100 justify-content-between"
            onClick={onClick}>
            <h5 className="mb-1">
              <a href="#" onClick={onClick}>{org.title}</a>
            </h5>
            <small><b>Last updated {since}</b></small>
          </div>
          <div
            className="d-flex w-100 justify-content-between"
            onClick={onClick}>
            {active}
            <small>Id: {org.id}</small>
          </div>
        </li>
      );
    });

    return (
      <div>
        <ul className="list-group">
          {items}
        </ul>
      </div>
    );
  }

  renderDescription() {
    return (
      <p><b>Organizations</b> are an advanced feature that allow a course package to
        support more than one arrangement of the course material.
      </p>
    );
  }

  render() {
    return (
      <div className="resource-view container-fluid new">
        <div className="row">
          <div className="col-sm-12 col-md-12 document">
            <div className="container-fluid editor">
              <div className="row">
                <div className="col-12">
                  {this.renderDescription()}
                  {this.renderCreation()}
                  {this.renderResources()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

