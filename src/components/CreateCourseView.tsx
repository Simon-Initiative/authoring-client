import * as React from 'react';

interface CreateCourseView {  
}

export interface CreateCourseViewProps {
  dispatch: any;
}

class CreateCourseView extends React.PureComponent<CreateCourseViewProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="createCourse full container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h1>Create a new course content package</h1>
            <p>After this process if you would like to change these settings you can always go to Settings > My Course</p>
          </div>
        </div>
        <div className="row">
          <fieldset>
            <input type="text" className="col-md-12" id="input" placeholder="Math Primer, Engineering Statics, Spanish"/>
            <label htmlFor="input">Course Name</label>
          </fieldset>
        </div>
        <div className="row">
          <div className="col-md-4 offset-sm-4">
            <button className="btn btn-secondary btn-lg btn-block outline serif">
              Create Course
            </button>
            <button className="btn btn-secondary btn-lg btn-block serif">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  

}

export default CreateCourseView;


