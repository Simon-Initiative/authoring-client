import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';

import ModalSelection from './ModalSelection';


interface ResourceSelection {

}

export interface ResourceSelectionProps {
  onInsert: (item: SelectableResource) => void;
  onCancel: () => void;
  courseId: string;
  filterPredicate: (res: persistence.CourseResource) => boolean;
}

export type SelectableResource = {
  id: types.DocumentId,
  type: string,
  title: string,
};

export interface ResourceSelectionState {
  resources: SelectableResource[];
  selected: SelectableResource; 
}

class ResourceSelection 
  extends React.PureComponent<ResourceSelectionProps, ResourceSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      selected: { id: '', type: '', title: '' },
    };
  }

  componentDidMount() {
    this.fetchResources();
  }

  fetchResources() {
    persistence.fetchCourseResources(this.props.courseId)
    .then(resources => resources.filter(this.props.filterPredicate))
    .then((filtered) => {
      this.setState({
        resources: filtered.map(
          d => ({ id: d._id, title: d.title, type: d.type })),
      });
    });
  }

  clickResource(selected) {
    this.setState({ selected });
  }

  renderRows() {
    const link = (r: SelectableResource) => 
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
      <ModalSelection title="Select Resource" 
        onCancel={this.props.onCancel} onInsert={() => this.props.onInsert(this.state.selected)}>
        <table className="table table-hover table-sm">
          <thead>
              <tr>
                  <th>Title</th>
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

export default ResourceSelection;

