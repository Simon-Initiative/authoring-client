import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';

import ModalSelection from '../../utils/selection/ModalSelection';


export interface ExistingSkillSelection {

}

type SkillId = string;

export interface ExistingSkillSelectionProps {
  skills: Immutable.List<contentTypes.Skill>;
  objective: contentTypes.LearningObjective;
  onInsert: (objective: contentTypes.LearningObjective, selected: SkillId) => void;
  onCancel: () => void;
  disableInsert: boolean;
}

export interface ExistingSkillSelectionState {
  selected: SkillId;
}

export class ExistingSkillSelection
  extends React.PureComponent<ExistingSkillSelectionProps, ExistingSkillSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      selected: undefined,
    };

    this.clickResource = this.clickResource.bind(this);
  }

  onInsert = () => this.props.onInsert(this.props.objective, this.state.selected);

  clickResource(e) {
    const selected = e.target.value;
    this.setState({ selected });
  }

  renderRows() {
    const link = (r: contentTypes.Skill) =>
      <button value={r.id} onClick={this.clickResource}
        className="btn btn-link">{r.title}</button>;

    return this.props.skills.map((r) => {
      const active = this.state.selected === r.id ? 'table-active' : '';
      return <tr key={r.id} className={active}>
        <td>{link(r)}</td>
      </tr>;
    });
  }


  render() {
    return (
      <ModalSelection title="Select Existing Skill"
        disableInsert={this.state.selected === undefined && this.props.disableInsert}
        onCancel={this.props.onCancel}
        onInsert={this.onInsert}>
        <table className="table table-hover table-sm">
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
