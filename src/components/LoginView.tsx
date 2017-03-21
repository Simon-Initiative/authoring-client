import * as React from 'react';

interface LoginView {  
}

export interface LoginViewProps {
  dispatch: any;
}

class LoginView extends React.PureComponent<LoginViewProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Login View</h1>
        <p>TODO</p>
      </div>
    );
  }
  

}

export default LoginView;


