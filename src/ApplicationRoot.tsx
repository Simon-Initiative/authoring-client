import * as React from 'react';
import Main from './Main.controller';

import { SlateTestbed } from './slate/SlateTestbed';

const Provider = (require('react-redux') as RR).Provider;

interface ApplicationRootProps {
  store: any;
}

interface RR {
  Provider: any;
}

/**
 * Application root component.
 */
export class ApplicationRoot extends React.Component<ApplicationRootProps, {}> {

  render(): JSX.Element {
    return (
      <Provider store={this.props.store}>
        <Main />
      </Provider>
    );
  }
}
