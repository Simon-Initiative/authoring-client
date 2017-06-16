import * as React from 'react';
import guid from '../utils/guid';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as courseActions from '../actions/course';
import * as viewActions from '../actions/view';
import { isNullOrUndefined } from 'util';

interface CreateCourseView {
  _onClickCancel: () => void;
}

export interface CreateCourseViewProps {
  dispatch: any;
}

class CreateCourseView extends React.PureComponent<CreateCourseViewProps, {}> {

  constructor(props) {
    super(props);
    this._onClickCancel = this.onClickCancel.bind(this);
  }

  createCourse(e) {
    e.preventDefault();
    const title = (this.refs['title'] as any).value;
    if (isNullOrUndefined(title) || title === '') {
      return;
    }
    const g = guid();
    const id = title.toLowerCase().split(' ')[0] + '-' + g.substring(g.lastIndexOf('-') + 1);
    const model = new models.CourseModel({ id, version: '1.0', title });

    persistence.createDocument(null, model)
      .then((document) => {
        // Get an updated course content package payload
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          this.props.dispatch(courseActions.courseChanged(document.model));
          viewActions.viewDocument(document._courseId, document._courseId);
        }
      })
      .catch(err => console.log(err));
  }

  onClickCancel() {
    viewActions.viewAllCourses();
  }

  render() {
    return (
      <div className="createCourse full container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h1>Create a new course content package</h1>

          </div>
        </div>
        <div className="row">
          <fieldset>
            <input type="text" ref="title" className="col-md-12" id="input"
                   placeholder="Math Primer, Engineering Statics, Spanish"/>
            <label htmlFor="input">Course Name</label>
          </fieldset>
        </div>
        <div className="row">
          <div className="col-md-4 offset-sm-4">
            <button onClick={this.createCourse.bind(this)}
                    className="btn btn-secondary btn-lg btn-block outline serif">
              Create Course
            </button>
            <button onClick={this._onClickCancel}
                    className="btn btn-secondary btn-lg btn-block serif">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateCourseView;


