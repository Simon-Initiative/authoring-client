import * as React from 'react';

import * as persistence from '../data/persistence';
import { document as documentActions } from '../actions/document';
import { titlesForCoursesQuery } from '../data/domain';

interface Courses {
  onSelect: (id) => void;
}

type CourseDescription = {
  id: string,
  title: string
}

export interface CoursesProps {
  courseIds: string[];
  dispatch: any;
}

class Courses extends React.PureComponent<CoursesProps, { courses: CourseDescription[]}> {

  constructor(props) {
    super(props);

    this.state = { courses: []};
    this.onSelect = (id) => {
      this.props.dispatch(documentActions.viewDocument(id));
    }
  }

  componentDidMount() {

    persistence.queryDocuments(titlesForCoursesQuery(this.props.courseIds))
      .then(docs => {
        let courses : CourseDescription[] = docs.map(d => ({ id: d._id, title: (d as any).title.text}));
        this.setState({ courses });
      })
      .catch(err => {

      });
  }  

  render() {

    let rows = this.state.courses.map((c, i) => {
      const { id, title} = c;
      return <tr key={id}><td>
          <button key={id} onClick={this.onSelect.bind(this, id)} 
            className="btn btn-link">{title}</button>
        </td></tr>
    });

    return (
      <div>
      <h1>Courses</h1>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Example #1</th>
              <th>Example #2</th>
              <th>Example #3</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
  

}

export default Courses;


