import * as React from 'react';
import { Tooltip } from 'utils/tooltip';
import './HelpPopover.scss';
import { ModalMessage } from 'utils/ModalMessage';

export type HelpPopoverProps = {
  position?: Position,
  activateOnClick?: boolean,
  modalTitle?: string;
  displayModal: (component: any) => void;
  dismissModal: () => void;
};

export enum Position {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Down = 'down',
}

const DEFAULT_TOOLTIP_PROPS = {
  theme: 'light',
  animation: 'shift',
  interactive: true,
  arrow: true,
  position: Position.Top,
  className: 'help-popover',
  activateOnClick: false,
};

const mergeWithDefaultProps = props =>
  Object.assign({}, DEFAULT_TOOLTIP_PROPS, props);

export class HelpPopover extends React.PureComponent<HelpPopoverProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const props = mergeWithDefaultProps(this.props);

    const modal = <ModalMessage title={props.modalTitle}
      onCancel={props.dismissModal}>{this.props.children}</ModalMessage>;

    return props.activateOnClick
      ? <div className="help-popover help-popover-container help-popover-trigger">
        <i onClick={() => props.displayModal(modal)}
           className={'fa fa-question-circle'}></i>
      </div>

      : <Tooltip
        {...props}
        html={
          <div className="help-popover-container">
            {this.props.children}
          </div>}>
        <i className={'fa fa-question-circle'}></i>
      </Tooltip>;
  }
}
