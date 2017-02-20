'use strict'

import * as React from 'react';

import * as persistence from '../data/persistence';
import { document as documentActions } from '../actions/document';

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

    let coursesQuery = {
      selector: {
        '_id': {'$in': this.props.courseIds},
        'metadata.type': {'$eq': 'course'}
      },
      fields: ['_id', 'content.title']
    }
    persistence.queryDocuments(coursesQuery)
      .then(docs => {
        let courses : CourseDescription[] = docs.map(d => ({ id: d._id, title: (d.content as any).title}));
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
        <table className="table table-striped table-hover"> 
          <thead>
              <tr>
                  <th>Courses</th>
              </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>);
  }
  

}

export default Courses;


