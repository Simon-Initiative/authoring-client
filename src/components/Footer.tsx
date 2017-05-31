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
      <footer className="footer">
        <div className="container">
            <div className="row">
                <div className="license col-md-8">
                  <img src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" className="ccLicense" />
                  Unless otherwise noted this work is licensed under a 
                    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license"> Creative Commons Attribution-NonCommercial-ShareAlike 4.0 Unported License</a>
                </div>
                <div className="col-md-3" role="contentinfo" id="tinyfooter">
                    <a className="oli" href="/">Open Learning Initiative</a>
                </div>
            </div>
        </div>
      </footer>
    );
  }
  
}

export default Footer;