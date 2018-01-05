import * as React from 'react';

import './Footer.scss';

interface Footer {
}

export interface FooterProps {

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
                <div className="license col-md-10">
                  <img
                    className="ccLicense"
                    src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />
                  Unless otherwise noted this work is licensed under a<span> </span>
                  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license">
                    Creative Commons Attribution-NonCommercial-ShareAlike 4.0 Unported License
                  </a>
                </div>
            </div>
        </div>
      </footer>
    );
  }

}

export default Footer;
