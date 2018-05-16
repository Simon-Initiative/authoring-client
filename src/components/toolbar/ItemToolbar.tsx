import * as React from 'react';
import { injectSheet, JSSProps } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import { ActiveContextState } from 'reducers/active';

import { styles } from './ItemToolbar.styles';
import { loadFromLocalStorage } from 'utils/localstorage';

export interface ItemToolbarProps {
  context: AppContext;
  activeContext: ActiveContextState;
  onCut: (item) => void;
  onCopy: (item) => void;
  onPaste: () => void;
  onRemove: (item) => void;
  parentSupportsElementType: (type: string) => boolean;
}

/**
 * InsertToolbar React Stateless Component
 */
@injectSheet(styles)
export class ItemToolbar extends React.PureComponent<ItemToolbarProps & JSSProps> {

  constructor(props) {
    super(props);
  }

  hasSelection() {
    const { activeContext } = this.props;
    return !!activeContext.activeChild.valueOr(false);
  }

  canDuplicate() {
    const { activeContext } = this.props;

    const disallowDuplicates = ['WbInline', 'Activity', 'Speaker', 'Line'];

    return activeContext.activeChild.caseOf({
      just: activeChild => activeChild &&
        (disallowDuplicates.indexOf((activeChild as any).contentType) === -1),
      nothing: () => false,
    });
  }

  getItem() {
    const { activeContext } = this.props;
    return activeContext.activeChild.caseOf({
      just: activeChild => activeChild,
      nothing: () => undefined,
    });
  }

  getContainer() {
    const { activeContext } = this.props;
    return activeContext.container.caseOf({
      just: container => container,
      nothing: () => undefined,
    });
  }

  render() {
    const {
      classes, onCut, onCopy, onPaste, onRemove, parentSupportsElementType,
    } = this.props;

    const canMoveUp = true;
    const canMoveDown = true;

    const clipboardItem: any = loadFromLocalStorage('clipboard');
    // saveToLocalStorage handles saving contiguous text as a special
    // case, so we handle that here
    let clipboardElementType = null;

    if (clipboardItem !== null) {
      clipboardElementType = clipboardItem.isContiguousText
      ? '#text'
      : Object.keys(clipboardItem)[0];
    }

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onCut(this.getItem())}
            tooltip="Cut Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection() && this.canDuplicate())}>
            <i className="fa fa-cut" /> Cut
          </ToolbarButton>
          <ToolbarButton
            onClick={() => onCopy(this.getItem())}
            tooltip="Copy Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection() && this.canDuplicate())}>
            <i className="fa fa-copy" /> Copy
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onPaste()}
            tooltip="Paste Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection() &&
              clipboardItem !== null &&
              parentSupportsElementType(clipboardElementType))}>
            <i className="fa fa-paste" /> Paste
          </ToolbarButton>
          <ToolbarButton
            className={classes.removeButton}
            onClick={() => onRemove(this.getItem())}
            tooltip="Remove Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection())}>
            <i className="fa fa-close" /> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => this.getContainer().onMoveUp(this.getItem())}
            tooltip="Move Item Up"
            size={ToolbarButtonSize.Small}
            disabled={!(this.hasSelection() && canMoveUp)}>
            <i className="fa fa-long-arrow-up" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => this.getContainer().onMoveDown(this.getItem())}
            tooltip="Move Item Down"
            size={ToolbarButtonSize.Small}
            disabled={!(this.hasSelection() && canMoveDown)}>
            <i className="fa fa-long-arrow-down" />
          </ToolbarButton>
        </ToolbarLayout.Column>
      </React.Fragment>
    );
  }
}
