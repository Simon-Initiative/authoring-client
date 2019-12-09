import * as React from 'react';
import { withStyles } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import { ActiveContextState } from 'reducers/active';

import { styles } from './ItemToolbar.styles';
import { loadFromLocalStorage } from 'utils/localstorage';
import { ContentElement } from 'data/content/common/interfaces';
import { CourseModel } from 'data/models';
import { nonMoveableTypes, nonRemovableTypes } from 'data/content/restrictions';
import { StyledComponentProps } from 'types/component';

export interface ItemToolbarProps {
  context: AppContext;
  editMode: boolean;
  activeContext: ActiveContextState;
  onCut: (item: ContentElement, page: string) => void;
  onCopy: (item: ContentElement, page: string) => void;
  onPaste: () => void;
  onRemove: (item: ContentElement) => void;
  parentSupportsElementType: (type: string) => boolean;
  course: CourseModel;
  modelId: string;
}

type StyledItemToolbarProps = StyledComponentProps<ItemToolbarProps, typeof styles>;

/**
 * InsertToolbar React Component
 */
class ItemToolbar
  extends React.PureComponent<StyledItemToolbarProps> {

  constructor(props: StyledItemToolbarProps) {
    super(props);
  }

  hasSelection() {
    const { activeContext } = this.props;
    return activeContext.activeChild.caseOf({
      just: _ => true,
      nothing: () => false,
    });
  }

  canDuplicate() {
    const { activeContext } = this.props;

    const disallowDuplicates = ['Multipanel', 'WbInline', 'Activity', 'Speaker', 'Line', 'Hint', 'RichText'];

    return activeContext.activeChild.caseOf({
      just: activeChild => activeChild &&
        disallowDuplicates.indexOf(activeChild.contentType) === -1,
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

  getPage() {
    const { modelId } = this.props;

    return modelId === null ? undefined : modelId;
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
      classes, editMode, onCut, onCopy, onPaste, onRemove, parentSupportsElementType, activeContext,
    } = this.props;

    const canMove = activeContext.activeChild.caseOf({
      just: c => !nonMoveableTypes[c.contentType],
      nothing: () => false,
    });

    const canRemove = activeContext.activeChild.caseOf({
      just: c => !nonRemovableTypes[c.contentType],
      nothing: () => false,
    });

    const clipboardItem: any = loadFromLocalStorage('clipboard');
    // saveToLocalStorage handles saving contiguous text as a special
    // case, so we handle that here
    let clipboardElementType: string = null;

    if (clipboardItem !== null) {
      clipboardElementType = clipboardItem.isContiguousText
        ? '#text'
        : Object.keys(clipboardItem)[0];
    }

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onCut(this.getItem(), this.getPage())}
            tooltip="Cut Item"
            size={ToolbarButtonSize.Wide}
            disabled={!editMode || !(this.hasSelection() && this.canDuplicate())}>
            <i className="fa fa-cut" /> Cut
          </ToolbarButton>
          <ToolbarButton
            onClick={() => onCopy(this.getItem(), this.getPage())}
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
            disabled={!editMode || !(this.hasSelection() &&
              clipboardItem !== null &&
              parentSupportsElementType(clipboardElementType))}>
            <i className="fa fa-paste" /> Paste
          </ToolbarButton>
          <ToolbarButton
            className={classes.removeButton}
            onClick={() => onRemove(this.getItem())}
            tooltip="Remove Item"
            size={ToolbarButtonSize.Wide}
            disabled={!editMode || !(this.hasSelection() && canRemove)}>
            <i className="fas fa-times" /> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => this.getContainer().onMoveUp(this.getItem())}
            tooltip="Move Item Up"
            size={ToolbarButtonSize.Small}
            disabled={!editMode || !(this.hasSelection() && canMove)}>
            <i className="fas fa-long-arrow-alt-up" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => this.getContainer().onMoveDown(this.getItem())}
            tooltip="Move Item Down"
            size={ToolbarButtonSize.Small}
            disabled={!editMode || !(this.hasSelection() && canMove)}>
            <i className="fas fa-long-arrow-alt-down" />
          </ToolbarButton>
        </ToolbarLayout.Column>
      </React.Fragment>
    );
  }
}

const Styled = withStyles<ItemToolbarProps>(styles)(ItemToolbar);
export { Styled as ItemToolbar };
