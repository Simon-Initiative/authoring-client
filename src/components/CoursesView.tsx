import * as React from 'react';

import * as persistence from '../data/persistence';
import * as viewActions from '../actions/view';
import { titlesForCoursesQuery, coursesQuery } from '../data/domain';

interface CoursesView {
  onSelect: (id) => void;
}

type CourseDescription = {
  id: string,
  title: string
}

export interface CoursesViewProps {
  userId: string; 
  dispatch: any;
}

class CoursesView extends React.PureComponent<CoursesViewProps, { courses: CourseDescription[]}> {

  constructor(props) {
    super(props);

    this.state = { courses: []};
    this.onSelect = (id) => {
      this.props.dispatch(viewActions.viewDocument(id));
    }
  }

  componentDidMount() {

    persistence.queryDocuments(coursesQuery(this.props.userId))
      .then(docs => {
        const courseIds = docs.map(result => (result as any).courseId);
        return persistence.queryDocuments(titlesForCoursesQuery(courseIds))
      })
      .then(docs => {
        let courses : CourseDescription[] = docs.map(d => ({ id: d._id, title: (d as any).title.text}));
        this.setState({ courses });
      })
      .catch(err => {
        console.log(err);
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
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
  

}

export default CoursesView;


