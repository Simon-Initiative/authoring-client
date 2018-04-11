import * as React from 'react';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { DiscoverableId } from 'types/discoverable';
import { DiscoverableState as DiscoverableReducerState } from 'reducers/discoverable';
import createGuid from 'utils/guid';

import { styles } from './Discoverable.styles';

const SPOTLIGHT_DURATION = 2000;

export interface DiscoverableProps {
  id: DiscoverableId;
  discoverables: DiscoverableReducerState;
  onDiscover?: () => void;
}

export interface DiscoverableState {
  lastDiscovery: string;
  spotlight: boolean;
}

/**
 * Discoverable React Component
 */
@injectSheet(styles)
export class Discoverable
    extends React.PureComponent<StyledComponentProps<DiscoverableProps>,
    DiscoverableState> {
  id: string;

  constructor(props) {
    super(props);

    this.state = {
      lastDiscovery: undefined,
      spotlight: false,
    };

    this.id = `discoverable-${createGuid()}`;

    this.discover = this.discover.bind(this);
  }

  componentWillReceiveProps(nextProps: DiscoverableProps) {
    const { id } = this.props;
    const { lastDiscovery } = this.state;

    const discovery = nextProps.discoverables.get(id);
    if (discovery !== lastDiscovery) {
      this.discover();
    }
  }

  discover() {
    const { onDiscover } = this.props;

    this.setState(
      {
        spotlight: true,
      });

    setTimeout(
      () => this.setState({
        spotlight: false,
      }),
      SPOTLIGHT_DURATION,
    );

    onDiscover && onDiscover();
  }

  render() {
    const { className, children, classes, id } = this.props;
    const { spotlight } = this.state;

    return (
      <div
        id={this.id}
        className={classNames([classes.discoverable ,className, spotlight && classes.spotlight])}>
        {children}
      </div>
    );
  }
}
