import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';

import ModalSelection from '../../utils/selection/ModalSelection';
import { ResourceId } from 'data/types';
import { Maybe } from 'tsmonad';


export interface ExistingSkillSelection {

}

export interface ExistingSkillSelectionProps {
  skills: Immutable.List<contentTypes.Skill>;
  objective: contentTypes.LearningObjective;
  onInsert: (objective: contentTypes.LearningObjective, selectedSkill: ResourceId) => void;
  onCancel: () => void;
  disableInsert: boolean;
}

export interface ExistingSkillSelectionState {
  selectedSkill: Maybe<ResourceId>;
}

export class ExistingSkillSelection
  extends React.PureComponent<ExistingSkillSelectionProps, ExistingSkillSelectionState> {

  state = {
    ...this.state,
    selectedSkill: Maybe.nothing<ResourceId>(),
  };

  clickResource = (e: any) => {
    const selectedSkill = e.target.value;
    this.setState({ selectedSkill });
  }

  renderRows() {
    const link = (r: contentTypes.Skill) =>
      <button value={r.id.value()} onClick={this.clickResource}
        className="btn btn-link">{r.title}</button>;

    return this.props.skills.map((r) => {
      const active = this.state.selectedSkill.caseOf({
        just: skillId => skillId.eq(r.id) && 'table-active',
        nothing: () => '',
      });
      return <tr key={r.id.value()} className={active}>
        <td>{link(r)}</td>
      </tr>;
    });
  }


  render() {
    return (
      <ModalSelection title="Select Existing Skill"
        disableInsert={this.state.selectedSkill.caseOf({
          just: skillId => this.props.disableInsert,
          nothing: () => true,
        })}
        onCancel={this.props.onCancel}
        onInsert={() => this.state.selectedSkill.caseOf({
          just: skillId => this.props.onInsert(this.props.objective, skillId),
          nothing: () => undefined,
        })}>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Skill</th>
            </tr>
          </thead>
          <tbody>
            {this.renderRows()}
          </tbody>
        </table>
      </ModalSelection>
    );
  }
}
