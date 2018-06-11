import * as React from 'react';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { getVersion } from 'utils/buildinfo';

import './Footer.scss';

export interface FooterProps {
  name: string;
  email: string;
}

class Footer extends React.PureComponent<FooterProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    const { name, email } = this.props;

    const formUrl = buildFeedbackFromCurrent(name, email);
    const CREATIVE_COMMONS_URL = 'https://creativecommons.org/licenses/by-nc-sa/4.0/';
    const QUICK_START_GUIDE_URL
      = 'https://docs.google.com/document/d/1B_AQpFRn2zue6-'
      + 'nW6h8z6bOGfHWYqAjI7WCZ-WQMrf4/edit?usp=sharing';

    return (
      <footer className="footer">
        <div className="footer-section left">
          <div className="quick-links">
            <a href={QUICK_START_GUIDE_URL} target="_blank">Quick Start Guide</a>
            {'|'}
            <a href={formUrl} target="_blank">Help / Feedback</a>
          </div>
        </div>
        <div className="footer-section center">
          <div className="centered">
            Unless otherwise noted, this work is licensed under a&nbsp;
              <a href={CREATIVE_COMMONS_URL} target="_blank" rel="license">
              Creative Commons BY-NC-SA 4.0
              </a>
          </div>
        </div>
        <div className="footer-section right">
          Course Author v{getVersion()}
        </div>
      </footer>
    );
  }

}

export default Footer;
