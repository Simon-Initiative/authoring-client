import * as React from 'react';

interface Footer {  
}

export interface FooterProps {
  dispatch: any;
}

class Footer extends React.PureComponent<FooterProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
      </div>
    );
  }
  
}

export default Footer;