import * as React from 'react';
import * as models from 'data/models';
import { Maybe } from 'tsmonad';
import { Select } from 'editors/content/common/Select';
import { Precondition } from 'data/content/org/precondition';
import { Preconditions } from 'data/content/org/preconditions';
import * as t from 'data/content/org/types';

import * as org from 'data/models/utils/org';

import './Preconditions.scss';

export interface PreconditionsEditorProps {
  org: models.OrganizationModel;
  placements: org.Placements;
  preconditions: Maybe<Preconditions>;
  parentId: string;
  editMode: boolean;
  course: models.CourseModel;
  onEdit: (p: Maybe<Preconditions>) => void;
}


export interface PreconditionsEditorState {

}

/**
 * Allows editing of preconditions.
 */
export class PreconditionsEditor
  extends React.PureComponent<PreconditionsEditorProps,
  PreconditionsEditorState> {

  constructor(props) {
    super(props);

    this.onAdd = this.onAdd.bind(this);
  }

  onAdd() {

    const n = new Precondition().with({
      idref: this.props.placements.first().node.id,
    });

    const p = this.props.preconditions.valueOr(new Preconditions());
    const preconditions = p.preconditions.set(n.guid, n);
    const u = p.with({ preconditions });
    this.props.onEdit(Maybe.just(u));
  }

  onRemove(p: Precondition) {
    this.props.preconditions.lift((pre) => {
      const preconditions = pre.preconditions.delete(p.guid);
      if (preconditions.size === 0) {
        this.props.onEdit(Maybe.nothing());
      } else {
        this.props.onEdit(Maybe.just(pre.with({ preconditions })));
      }
    });
  }

  onEditConstraint(p: Precondition, condition) {
    const u = p.with({ condition });
    this.props.preconditions.lift((pre) => {
      const preconditions = pre.preconditions.set(u.guid, u);
      this.props.onEdit(Maybe.just(pre.with({ preconditions })));
    });
  }

  onEditConstrainer(p: Precondition, idref: string) {
    const u = p.with({ idref });
    this.props.preconditions.lift((pre) => {
      const preconditions = pre.preconditions.set(u.guid, u);
      this.props.onEdit(Maybe.just(pre.with({ preconditions })));
    });
  }

  renderConstrainer(p: Precondition) {

    const options = this.props.placements.toArray().map((p) => {
      let title;
      if (p.node.contentType === 'Item') {
        title = this.props.course.resourcesById.get(p.node.resourceref.idref).title;
      } else if (p.node.contentType === 'Include') {
        title = 'Include';
      } else {
        const containerLabel = this.props.org.labels[p.node.contentType.toLowerCase()];
        title = containerLabel + ' ' + p.positionAtLevel.valueOr(0) + ': ' + (p.node as any).title;
      }
      const padding = '-'.repeat((p.level * 2) + 1).substr(1);
      return (
        <option value={p.node.id}>{padding + title}</option>
      );
    });

    return (
      <Select
        editMode={this.props.editMode}
        value={p.idref}
        onChange={c => this.onEditConstrainer(p, c)}>
        {options}
      </Select>
    );
  }

  renderContraint(p: Precondition) {
    return (
      <Select
        editMode={this.props.editMode}
        value={p.condition}
        onChange={c => this.onEditConstraint(p, c)}>
        <option value={t.ConditionTypes.None}>None</option>
        <option value={t.ConditionTypes.Accessed}>Accessed</option>
        <option value={t.ConditionTypes.Completed}>Completed</option>
        <option value={t.ConditionTypes.Started}>Started</option>
      </Select>
    );
  }

  renderPrecondition(p: Precondition) {
    return (
      <tr>
        <td>{this.renderConstrainer(p)}</td>
        <td>{this.renderContraint(p)}</td>
        <td>
          <button
            disabled={!this.props.editMode}
            tabIndex={-1}
            onClick={() => this.onRemove(p)}
            type="button"
            className="btn btn-sm">
            <i className="fas fa-times" />
          </button>
        </td>
      </tr>
    );
  }

  renderContent(preconditions: Preconditions) {

    const all = preconditions.preconditions.toArray().map(p => this.renderPrecondition(p));
    return (
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Component</th>
            <th>Constraint</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {all}
        </tbody>
      </table>
    );
  }



  renderAdd() {
    return (
      <button
        disabled={!this.props.editMode}
        tabIndex={-1}
        onClick={this.onAdd}
        type="button"
        className="btn btn-sm">
        <i className="fas fa-plus" />
      </button>
    );
  }

  render() {

    const experimentalOrgEditing = (window as Window)
      .localStorage.getItem('experimental-org-editing') === 'true';
    if (!experimentalOrgEditing) {
      return null;
    }

    const content = this.props.preconditions.caseOf({
      just: p => this.renderContent(p),
      nothing: () => null,
    });

    return (
      <div className="preconditions">
        <div className="label">Preconditions</div>
        {content}
        {this.renderAdd()}
      </div>
    );
  }

}
