import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, injectSheet, JSSProps } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import { CourseModel } from 'data/models/course';
import { ActiveContextState } from 'reducers/active';
import { ParentContainer } from 'types/active';
import { handleKey, unhandleKey } from 'editors/document/common/keyhandlers';

import { styles } from './ItemToolbar.styles';

export interface ItemToolbarProps {
  context: AppContext;
  courseModel: CourseModel;
  activeContext: ActiveContextState;
  onCut: (item) => void;
  onCopy: (item) => void;
  onPaste: () => void;
  onRemove: (item) => void;
}

/**
 * InsertToolbar React Stateless Component
 */
@injectSheet(styles)
export class ItemToolbar extends React.PureComponent<ItemToolbarProps & JSSProps> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    handleKey(
      '⌘+x, ctrl+x',
      () => this.hasSelection() && this.canDuplicate(),
      () => this.props.onCut(this.getItem()),
    );
    handleKey(
      '⌘+c, ctrl+c',
      () => this.hasSelection() && this.canDuplicate(),
      () => this.props.onCopy(this.getItem()),
    );
    handleKey(
      '⌘+v, ctrl+v',
      () => this.hasSelection(),
      () => this.props.onPaste(),
    );
  }

  componentWillUnmount() {
    unhandleKey('⌘+x, ctrl+x');
    unhandleKey('⌘+c, ctrl+c');
    unhandleKey('⌘+v, ctrl+v');
  }

  hasSelection() {
    const { activeContext } = this.props;
    return !!activeContext.activeChild.valueOr(false);
  }

  canDuplicate() {
    const { activeContext } = this.props;
    return activeContext.activeChild.caseOf({
      just: activeChild => activeChild && ((activeChild as any).contentType !== 'WbInline'),
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
      classes, activeContext, courseModel, onCut, onCopy, onPaste, onRemove,
    } = this.props;

    const canMoveUp = true;
    const canMoveDown = true;

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onCut(this.getItem())}
            tooltip="Cut Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection && this.canDuplicate)}>
            <i className="fa fa-cut" /> Cut
          </ToolbarButton>
          <ToolbarButton
            onClick={() => onCopy(this.getItem())}
            tooltip="Copy Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection && this.canDuplicate)}>
            <i className="fa fa-copy" /> Copy
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => onPaste()}
            tooltip="Paste Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection)}>
            <i className="fa fa-paste" /> Paste
          </ToolbarButton>
          <ToolbarButton
            className={classes.removeButton}
            onClick={() => onRemove(this.getItem())}
            tooltip="Remove Item"
            size={ToolbarButtonSize.Wide}
            disabled={!(this.hasSelection)}>
            <i className="fa fa-close" /> Remove
          </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => this.getContainer().onMoveUp(this.getItem())}
            tooltip="Move Item Up"
            size={ToolbarButtonSize.Small}
            disabled={!(this.hasSelection && canMoveUp)}>
            <i className="fa fa-long-arrow-up" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => this.getContainer().onMoveDown(this.getItem())}
            tooltip="Move Item Down"
            size={ToolbarButtonSize.Small}
            disabled={!(this.hasSelection && canMoveDown)}>
            <i className="fa fa-long-arrow-down" />
          </ToolbarButton>
        </ToolbarLayout.Column>
      </React.Fragment>
    );
  }
}
