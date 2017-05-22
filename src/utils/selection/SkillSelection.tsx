import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';

import ModalSelection from './ModalSelection';


export interface SkillSelection {

}

export interface SkillSelectionProps {
  onInsert: (item: Skill) => void;
  onCancel: () => void;
  courseId: string;
}

export type Skill = {
  id: types.DocumentId,
  title: string,
};

export interface SkillSelectionState {
  resources: Skill[];
  selected: Skill; 
}

export class SkillSelection extends React.PureComponent<SkillSelectionProps, SkillSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      selected: { id: '', title: '' },
    };
  }

  componentDidMount() {
    this.fetchResources();
  }

  fetchResources() {
    persistence.fetchCourseResources(this.props.courseId)
    .then(resources => resources.filter(r => r.type === 'x-oli-skill_model'))
    .then((skills) => {
      this.setState({
        resources: skills.map(s => ({ id: s._id, title: s.title })),
      });
    });
  }

  clickResource(selected) {
    this.setState({ selected });
  }

  renderRows() {
    const link = (r: Skill) => 
      <button onClick={this.clickResource.bind(this, r)} 
        className="btn btn-link">{r.title}</button>;

    return this.state.resources.map((r) => {
      const active = r.id === this.state.selected.id ? 'table-active' : '';
      return <tr key={r.id} className={active}>
        <td>{link(r)}</td>
      </tr>;
    });
  }

  render() {
    return (
      <ModalSelection title="Select Skill" 
        onCancel={this.props.onCancel} 
        onInsert={() => this.props.onInsert(this.state.selected)}>
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




