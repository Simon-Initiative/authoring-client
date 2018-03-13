import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { getContentIcon } from 'editors/content/utils/content';

import styles from './ContentDecorator.style';

export interface ContentDecoratorProps {
  onRemove: () => void;
  onSelect: () => void;
  isActiveContent: boolean;
  contentType: string;
  hideContentLabel?: boolean;
}

export interface ContentDecoratorState {

}

@injectSheet(styles)
export class ContentDecorator
  extends React.Component<StyledComponentProps<ContentDecoratorProps>,
    ContentDecoratorState> {

  constructor(props, childState) {
    super(props);

  }

  render() {
    const {
      classes, isActiveContent, contentType, hideContentLabel,
      children, onSelect,
    } = this.props;

    return (
      <div className={classNames([
        'content-decorator',
        classes.contentDecorator,
        isActiveContent && 'active-content',
      ])}>
        {!hideContentLabel &&
          <div className={classNames([classes.handle, isActiveContent && 'active-content'])}
            onClick={onSelect}>
            <div className={classes.label}>
              {getContentIcon(contentType)}
            </div>
            <div className={classes.grip} />
          </div>
        }
        <div className={classes.content}>
        {children}
        </div>
      </div>
    );
  }
}
