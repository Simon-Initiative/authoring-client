import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { retrieveAllObjectives } from 'components/objectives/persistence';

import ModalSelection from './ModalSelection';
import { extractFullText } from 'data/content/objectives/objective';


export interface ObjectiveSelection {

}

export interface ObjectiveSelectionProps {
  onInsert: (objectives: Immutable.Set<contentTypes.LearningObjective>) => void;
  onCancel: () => void;
  courseId: string;
}

export interface ObjectiveSelectionState {
  objectives: Immutable.List<contentTypes.LearningObjective>;
  selected: Immutable.Set<contentTypes.LearningObjective>;
}

export class ObjectiveSelection
  extends React.PureComponent<ObjectiveSelectionProps, ObjectiveSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      objectives: Immutable.List<contentTypes.LearningObjective>(),
      selected: Immutable.Set<contentTypes.LearningObjective>(),
    };
  }

  componentDidMount() {
    retrieveAllObjectives(this.props.courseId)
      .then(objectives => this.setState({ objectives }));
  }

  clickResource(item) {
    if (this.state.selected.has(item)) {
      this.setState({ selected: this.state.selected.remove(item) });
    } else {
      this.setState({ selected: this.state.selected.add(item) });
    }
  }

  renderRows() {
    const link = (obj: contentTypes.LearningObjective) =>
      <button onClick={this.clickResource.bind(this, obj)}
        className="btn btn-link">{
          obj.rawContent.caseOf({ just: c => extractFullText(c), nothing: () => obj.title })
        }</button>;

    return this.state.objectives.toArray().map((r) => {
      const active = this.state.selected.has(r) ? 'table-active' : '';
      return <tr key={r.id} className={active}>
        <td>{link(r)}</td>
      </tr>;
    });
  }

  render() {
    return (
      <ModalSelection title="Select Learning Objective"
        onCancel={this.props.onCancel}
        onInsert={() => this.props.onInsert(this.state.selected)}>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Objective</th>
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




