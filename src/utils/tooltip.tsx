import * as React from 'react';
import {
  Tooltip as TippyTooltip,
  withTooltip as withTippyTooltip,
} from 'react-tippy';

const DEFAULT_TOOLTIP_PROPS = {
  animation: 'shift',
  arrow: true,
  theme: 'light',
};

const mergeWithDefaultProps = props =>
  Object.assign({}, DEFAULT_TOOLTIP_PROPS, props);

interface TooltipProps {
  disabled?: boolean;
  open?: boolean;
  useContext?: boolean;
  onRequestClose?: () => void;
  position?: string;
  trigger?: string;
  tabIndex? :number;
  interactive?: boolean;
  interactiveBorder?: number;
  delay?: number;
  hideDelay?: number;
  animation?: string;
  arrow?: boolean;
  arrowSize?: string;
  animateFill?: boolean;
  duration?: number;
  distance?: number;
  offset?: number;
  hideOnClick?: boolean | string;
  multiple?: boolean;
  followCursor?: boolean;
  inertia?: boolean;
  transitionFlip?: boolean;
  popperOptions?: object;
  html?: JSX.Element;
  // rawTemplate?: string | DOMElement;
  unmountHTMLWhenHide?: boolean;
  size?: string;
  sticky?: boolean;
  stickyDuration?: number;
  touchHold?: number;
  title?: string;
  onShow?: () => void;
  onShown?: () => void;
  onHide?: () => void;
  onHidden?: () => void;
  theme?: string;
  className?: string;
  style?: object;
}

export class Tooltip extends React.Component<TooltipProps> {
  render() {
    const props = mergeWithDefaultProps(this.props);

    return (
      <TippyTooltip {...props}>
        {props.children}
      </TippyTooltip>
    );
  }
}

export const withTooltip = (element, props: TooltipProps) =>
  withTippyTooltip(element, mergeWithDefaultProps(props));
