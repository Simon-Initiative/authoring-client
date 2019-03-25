import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { getContentIcon, insertableContentTypes } from 'editors/content/utils/content';

import { styles } from './ContentDecorator.styles';

export interface ContentDecoratorProps {
  onRemove: () => void;
  onSelect: () => void;
  isActiveContent: boolean;
  contentType: string;
  hideContentLabel?: boolean | string[];
  disableContentSelection?: boolean | string[];
  isHoveringContent: boolean;
  onMouseOver: (e) => void;
}

export interface ContentDecoratorState {

}

/**
 * ContentDecorator React Component
 */
class ContentDecorator
  extends React.Component<StyledComponentProps<ContentDecoratorProps, typeof styles>,
    ContentDecoratorState> {

  constructor(props) {
    super(props);

    this.hideContentLabel = this.hideContentLabel.bind(this);
  }

  hideContentLabel() {
    const { hideContentLabel, contentType } = this.props;

    return hideContentLabel === true
      || (Array.isArray(hideContentLabel) && hideContentLabel.find(type => type === contentType));
  }

  disableContentSelection() {
    const { disableContentSelection, contentType } = this.props;

    return disableContentSelection === true
      || (Array.isArray(disableContentSelection)
        && disableContentSelection.find(type => type === contentType));
  }

  render() {
    const {
      classes, isActiveContent, contentType,
      children, onSelect, onMouseOver, isHoveringContent, className,
    } = this.props;

    return (
      <div
        className={classNames([
          'content-decorator',
          classes.contentDecorator,
          isActiveContent && 'active-content',
          isHoveringContent && classes.hover,
          className,
        ])}
      onMouseOver={onMouseOver}>
        {this.hideContentLabel() || this.disableContentSelection()
          ? null
          : (
            <div
              className={classNames([
                classes.handle,
                isActiveContent && 'active-content',
              ])}
              onMouseDown={onSelect}>
              <div className={classes.label}>
                {getContentIcon(insertableContentTypes[contentType])}
              </div>
              <div className={classes.grip} />
            </div>
          )
        }
        <div className={classNames([
          classes.content,
          isActiveContent && 'active-content',
        ])}>
        {children}
        </div>
      </div>
    );
  }
}

const StyledContentDecorator = withStyles<ContentDecoratorProps>(styles)(ContentDecorator);
export { StyledContentDecorator as ContentDecorator };
