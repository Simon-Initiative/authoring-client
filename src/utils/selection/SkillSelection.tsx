import * as React from 'react';
import { Skill } from 'types/course';

import ModalSelection from './ModalSelection';


export interface SkillSelection {

}

export interface SkillSelectionProps {
  onInsert: (item: Skill) => void;
  onCancel: () => void;
  onFetchSkillTitles: (courseId: string) => Promise<Skill[]>;
  courseId: string;
}

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
    this.props.onFetchSkillTitles(this.props.courseId)
      .then ((titles) => {
        this.setState({
          resources: titles,
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




