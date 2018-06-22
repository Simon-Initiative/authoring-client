import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../data/contentTypes';

import ModalSelection from '../../utils/selection/ModalSelection';


export interface ExistingSkillSelection {

}

export interface ExistingSkillSelectionProps {
  skills: Immutable.List<contentTypes.Skill>;
  objective: contentTypes.LearningObjective;
  onInsert: (objective: contentTypes.LearningObjective, selected: Immutable.Set<string>) => void;
  onCancel: () => void;
  disableInsert: boolean;
}

export interface ExistingSkillSelectionState {
  selected: Immutable.Set<string>;
}

export class ExistingSkillSelection
  extends React.PureComponent<ExistingSkillSelectionProps, ExistingSkillSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      selected: Immutable.Set<string>(),
    };
  }

  onInsert = () => this.props.onInsert(this.props.objective, this.state.selected);

  clickResource(selected) {
    this.setState({ selected });
  }

  renderRows() {
    const link = (r: contentTypes.Skill) =>
      <button onClick={this.clickResource.bind(this, r.id)}
        className="btn btn-link">{r.title}</button>;

    return this.props.skills.map((r) => {
      const active = this.state.selected.includes(r.id) ? 'table-active' : '';
      return <tr key={r.id} className={active}>
        <td>{link(r)}</td>
      </tr>;
    });
  }


  render() {
    return (
      <ModalSelection title="Select Existing Skill"
        disableInsert={this.props.disableInsert}
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
