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
      <div>
        <h1>Create a new course</h1>
        <p>TODO</p>
      </div>
    );
  }
  

}

export default CreateCourseView;


