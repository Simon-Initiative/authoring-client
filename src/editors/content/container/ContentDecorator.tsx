import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames as jssClassNames } from 'styles/jss';
import { getContentIcon } from 'editors/content/utils/content';

import { styles } from './ContentDecorator.styles';

export interface ContentDecoratorProps {
  onRemove: () => void;
  onSelect: () => void;
  isActiveContent: boolean;
  contentType: string;
  hideContentLabel?: boolean;
  isHoveringContent: boolean;
  onMouseOver: () => void;
  className?: string;
  onCut: (item: Object) => void;
  onCopy: (item: Object) => void;
  onPaste: () => void;
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

  onPaste(e) {
    const data = e.clipboardData.getData('text');
    if (data === ' ') {
      e.preventDefault();
      e.stopPropagation();
      this.props.onPaste();
    }
  }

  render() {
    const {
      classes, isActiveContent, contentType, hideContentLabel,
      children, onSelect, onMouseOver, isHoveringContent, className,
    } = this.props;

    return (
      <div
        className={jssClassNames([
          'content-decorator',
          classes.contentDecorator,
          isActiveContent && 'active-content',
          isHoveringContent && classes.hover,
          className,
        ])}
        onMouseOver={(e) => { onMouseOver(); e.stopPropagation(); }}>
        {hideContentLabel
          ? null
          : (
            <div
              className={jssClassNames([
                classes.handle,
                isActiveContent && 'active-content',
              ])}
              onMouseDown={onSelect}>
              <div className={classes.label}>
                {getContentIcon(contentType)}
              </div>
              <div className={classes.grip} />
            </div>
          )
        }
        <div
          onPaste={this.onPaste}
          className={jssClassNames([
            classes.content,
            isActiveContent && 'active-content',
          ])}>
          {children}
        </div>
      </div>
    );
  }
}
