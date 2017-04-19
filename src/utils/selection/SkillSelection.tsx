import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';

import ModalSelection from './ModalSelection';


export interface SkillSelection {

}

export interface SkillSelectionProps {
  onInsert: (item: Skill) => void;
  onCancel: () => void;
}

export type Skill = {
  id: types.DocumentId,
  title: string
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
      selected: { id: '', title: ''}
    }
  }

  componentDidMount() {
    let query = {
      // TODO, fill in query to retrieve skill ids and titles
    }

    // TODO, replace setState with call to fetchResources
    this.setState({
      resources: [
        { id: '1', title: 'Skill 1'},
        { id: '2', title: 'Skill 2'},
        { id: '3', title: 'Skill 3'},
        { id: '4', title: 'Skill 4'},
        { id: '5', title: 'Skill 5'},
      ]
    })

    //this.fetchResources(query);
  }

  fetchResources(query: Object) {
    persistence.queryDocuments(query)
      .then(docs => {
        this.setState({
          resources: docs.map(d => ({ id: d._id, title: (d as any).title}))
        })
      });
  }

  clickResource(selected) {
    this.setState({selected});
  }

  renderRows() {
    let link = (r: Skill) => 
      <button onClick={this.clickResource.bind(this, r)} 
        className="btn btn-link">{r.title}</button>;

    return this.state.resources.map(r => {
        const active = r.id === this.state.selected.id ? 'table-active' : '';
        return <tr key={r.id} className={active}>
          <td>{link(r)}</td>
        </tr>
      })
  }

  render() {
    return (
      <ModalSelection title="Select Skill" onCancel={this.props.onCancel} onInsert={() => this.props.onInsert(this.state.selected)}>
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




