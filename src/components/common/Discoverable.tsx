import * as React from 'react';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { DiscoverableId } from 'types/discoverable';
import { DiscoverableState as DiscoverableReducerState } from 'reducers/discoverable';

import { styles } from './Discoverable.styles';

export interface DiscoverableProps {
  id: DiscoverableId;
  discoverables: DiscoverableReducerState;
  focusChild?: boolean | string;
}

export interface DiscoverableState {

}

/**
 * Discoverable React Component
 */
@injectSheet(styles)
export class Discoverable
    extends React.PureComponent<StyledComponentProps<DiscoverableProps>,
    DiscoverableState> {

  constructor(props) {
    super(props);

    this.focusChild = this.focusChild.bind(this);
  }

  componentDidMount() {
    this.focusChild();
  }

  componentWillReceiveProps(nextProps: DiscoverableProps) {
    this.focusChild();
  }

  focusChild() {
    const { id, discoverables, focusChild } = this.props;
    if (focusChild && discoverables.get(id)) {
      const jQ = (window as any).jQuery;

      if (focusChild === true) {
        jQ(`#discoverable-${id} > *`).focus();
      } else {
        jQ(`#discoverable-${id} ${focusChild}`).focus();
      }
    }
  }

  render() {
    const { className, children, classes, id, discoverables } = this.props;
    const spotlight = discoverables.get(id);

    return (
      <div
        id={`discoverable-${id}`}
        className={classNames([classes.discoverable ,className, spotlight && classes.spotlight])}>
        {children}
      </div>
    );
  }
}
