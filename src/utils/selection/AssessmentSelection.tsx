import * as React from 'react';

import * as types from '../../data/types';
import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as contentTypes from '../../data/contentTypes';
import ModalSelection from './ModalSelection';
import guid from '../guid';
import { CourseIdVers, DocumentId } from 'data/types';

export enum AssessmentsToDisplay {
  Formative,
  Summative,
  Both,
}

export interface AssessmentSelectionProps {
  courseIdVers: CourseIdVers;
  toDisplay: AssessmentsToDisplay;
  onInsert: (assessment: models.AssessmentModel) => void;
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

export class AssessmentSelection
  extends React.PureComponent<AssessmentSelectionProps, AssessmentSelectionState> {

  constructor(props) {
    super(props);

    this.state = {
      assessments: [],
      selected: { id: types.ResourceId.of(''), title: '' },
    };

    this.onInsert = this.onInsert.bind(this);
  }

  componentDidMount() {
    this.fetchAssessments();
  }

  fetchAssessments() {
    persistence.fetchCourseResources(this.props.courseIdVers)
      .then((resources) => {
        this.setState({
          assessments: resources
            .filter((d) => {
              if (this.props.toDisplay === AssessmentsToDisplay.Both) {
                return d.type === types.LegacyTypes.assessment2
                  || d.type === types.LegacyTypes.inline;
              }
              if (this.props.toDisplay === AssessmentsToDisplay.Formative) {
                return d.type === types.LegacyTypes.inline;
              }
              if (this.props.toDisplay === AssessmentsToDisplay.Summative) {
                return d.type === types.LegacyTypes.assessment2;
              }
            })
            .map(d => ({ id: d._id, title: d.title })),
        });
      });
  }

  createAssessment(e) {

    e.preventDefault();

    const title = (this.refs['title'] as any).value;
    // :TODO: get a real id value from user ui input field?
    const id = title.split(' ')[0] + guid();
    const type = this.props.toDisplay === AssessmentsToDisplay.Formative
      ? types.LegacyTypes.inline
      : types.LegacyTypes.assessment2;

    const resource = {
      id,
      type,
      title,
    };
    const res = contentTypes.Resource.fromPersistence(resource);
    const assessment = new models.AssessmentModel({
      resource: res,
      type,
      title: new contentTypes.Title({ text: resource.title }),
    });

    persistence.createDocument(this.props.courseIdVers, assessment)
      .then(result => this.props.onInsert(result.model as models.AssessmentModel));
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
      return <tr key={r.id.value()} className={active}>
        <td>{link(r)}</td>
      </tr>;
    });
  }

  onInsert(id: DocumentId) {
    persistence.retrieveDocument(this.props.courseIdVers, id)
      .then(result => this.props.onInsert(result.model as models.AssessmentModel));
  }

  render() {
    return (
      <ModalSelection title="Select Assessment" onCancel={this.props.onCancel}
        onInsert={() => this.onInsert(this.state.selected.id)}>
        <table className="table table-sm">
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

