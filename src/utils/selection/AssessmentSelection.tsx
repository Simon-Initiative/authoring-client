import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as contentTypes from '../../data/contentTypes';
import ModalSelection from './ModalSelection';
import guid from '../guid';

interface AssessmentSelection {

}

export interface AssessmentSelectionProps {
  courseId: string;
  onInsert: (item: SelectableAssessment) => void;
  onCancel: () => void;
}

export type SelectableAssessment = {
  id: types.DocumentId,
  title: string,
};

export interface AssessmentSelectionState {
  assessments: SelectableAssessment[];
  selected: SelectableAssessment;
}

class AssessmentSelection 
  extends React.PureComponent<AssessmentSelectionProps, AssessmentSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      assessments: [],
      selected: { id: '', title: '' },
    };
  }

  componentDidMount() {
    this.fetchAssessments();
  }

  fetchAssessments() {
    persistence.fetchCourseResources(this.props.courseId)
    .then((resources) => {
      this.setState({
        assessments: resources
          .filter(d => d.type === types.LegacyTypes.assessment2 
            || d.type === types.LegacyTypes.inline)
          .map(d => ({ id: d._id, title: d.title })),
      });
    });
  }

  createAssessment(e) {

    e.preventDefault();

    const title = (this.refs['title'] as any).value;
    // :TODO: get a real id value from user ui input field?
    const id = title.split(' ')[0] + guid();
    const resource = { id, type: 'x-oli-assessment', title };
    const res = contentTypes.Resource.fromPersistence(resource);
    const assessment = new models.AssessmentModel({
      resource: res,
      title: new contentTypes.Title({ text: resource.title }),
    });

    persistence.createDocument(this.props.courseId, assessment)
    .then(result => this.setState({
      assessments: [...this.state.assessments, { id: result._id, title }],
      selected: { id: result._id, title },
    }));
  }

  clickAssessment(selected) {
    this.setState({ selected });
  }

  renderRows() {
    const link = (r: SelectableAssessment) =>
        <button onClick={this.clickAssessment.bind(this, r)}
                className="btn btn-link">{r.title}</button>;

    return this.state.assessments.map((r) => {
      const active = r.id === this.state.selected.id ? 'table-active' : '';
      return <tr key={r.id} className={active}>
            <td>{link(r)}</td>
        </tr>;
    });
  }

  render() {
    return (
        <ModalSelection title="Select Assessment" onCancel={this.props.onCancel}
                        onInsert={() => this.props.onInsert(this.state.selected)}>
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

          <form className="form-inline">
            <input type="text" ref="title" 
                className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
                    placeholder="Title"></input>
            <button onClick={this.createAssessment.bind(this)} 
                className="btn btn-primary">Create New</button>
          </form>

        </ModalSelection>
    );
  }

}

export default AssessmentSelection;



