import * as React from 'react';

import './Toast.scss';

export interface ToastProps {
  className?: string;
  style?: React.CSSProperties;
  icon: JSX.Element;
  heading: string;
  content: JSX.Element;
  severity: Severity;
}

export interface ToastState {

}

export enum Severity {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Waiting = 'waiting',
  Success = 'success',
}

export class Toast
  extends React.Component<ToastProps, ToastState> {

  render() {
    const { className, style, icon, heading, content, severity } = this.props;

    return (
      <div style={style} className={`toast ${severity} ${className ? className : ''}`}>
        <div className="toast-icon">
          {icon}
        </div>
        <div className="toast-content">
          <h4 className="toast-heading">{heading}</h4>
          {content}
        </div>
      </div>
    );
  }
}
