import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames, JSSStyles } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';
import colors from 'styles/colors';

export const styles: JSSStyles = {
  Skill: {

  },
};

export interface IssueTooltipProps {
  show: boolean;
}

/**
 * IssueTooltip React Stateless Component
 */
export const IssueTooltip: React.StatelessComponent<StyledComponentProps<IssueTooltipProps>>
  = injectSheetSFC<IssueTooltipProps>(styles)(({
  className, classes, children, show,
}) => {
    return show ? (
      <Tooltip
        html={children}
        interactive={true}
        theme="light"
        size="small"
        arrowSize="small">
        <i className={classNames(['fa fa-exclamation-circle'])}
          style={{ color: colors.danger, margin: '0px 4px' }} />
      </Tooltip>
    )
    : null;
  });
