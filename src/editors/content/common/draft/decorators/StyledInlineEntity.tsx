import * as React from 'react';
import { Tooltip } from 'utils/tooltip';

export interface StyledInlineEntityProps {
  className: string;
  offsetKey: number;
  tooltip: string;
}

export class StyledInlineEntity extends React.PureComponent<StyledInlineEntityProps, {}> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {

    const { tooltip, offsetKey, children, className } = this.props;

    return (
      <Tooltip title={tooltip} delay={1000} size="small" arrowSize="small">
        <a className={className}
          data-offset-key={offsetKey}>
          {children}
        </a>
      </Tooltip>
    );
  }
}
