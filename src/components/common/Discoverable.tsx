import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { DiscoverableId } from 'types/discoverable';
import { DiscoverableState as DiscoverableReducerState } from 'reducers/discoverable';

import { styles } from './Discoverable.styles';

export enum FocusAction {
  Focus,
  Click,
}

export interface DiscoverableProps {
  id: DiscoverableId;
  discoverables: DiscoverableReducerState;
  focusChild?: boolean | string;
  focusAction?: FocusAction;
  onDiscover?: () => void;
}

export interface DiscoverableState {

}

/**
 * Discoverable React Component
 */
class Discoverable
  extends React.Component<StyledComponentProps<DiscoverableProps, typeof styles>,
  DiscoverableState> {

  constructor(props) {
    super(props);

    this.focusChild = this.focusChild.bind(this);
  }

  componentDidMount() {
    this.focusChild();
  }

  componentDidUpdate() {
    this.focusChild();
  }

  focusChild() {
    const { id, discoverables, focusChild, focusAction } = this.props;

    if (focusChild && discoverables.get(id)) {
      const jQ = (window as any).jQuery;
      const child = (typeof focusChild === 'boolean')
        ? jQ(`#discoverable-${id} > *:first-child`)
        : jQ(`#discoverable-${id} ${focusChild}`);

      switch (focusAction) {
        case FocusAction.Click:
          child.trigger('click');
          return;
        case FocusAction.Focus:
        default:
          child.focus();
          return;
      }
    }
  }

  render() {
    const { className, children, classes, id, discoverables } = this.props;
    const spotlight = discoverables.get(id);

    return (
      <div
        id={`discoverable-${id}`}
        className={classNames([classes.discoverable, className, spotlight && classes.spotlight])}>
        {children}
      </div>
    );
  }
}

const StyledDiscoverable = withStyles<DiscoverableProps>(styles)(Discoverable);
export { StyledDiscoverable as Discoverable };
