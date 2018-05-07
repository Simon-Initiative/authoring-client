import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TG_COL } from 'data/content/assessment/dragdrop/target_group';

import { styles } from './CustomEditor.styles';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';
import { Initiator } from './dynadragdrop/Initiator';
import { DynaDropTarget } from './dynadragdrop/DynaDropTarget';
import { Button } from 'editors/content/common/Button';

export interface CustomEditorProps extends AbstractContentEditorProps<Custom> {
  onShowSidebar: () => void;
}

export interface CustomEditorState {

}

@injectSheet(styles)
export default class CustomEditor
  extends AbstractContentEditor<Custom,
    StyledComponentProps<CustomEditorProps>, CustomEditorState> {

  constructor(props) {
    super(props);

    this.renderDynaDrop = this.renderDynaDrop.bind(this);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Custom} columns={4}>
      </ToolbarGroup>
    );
  }

  removeInitiator(guid: string) {
    console.log('NOT IMPLEMENTED');
  }

  renderDynaDrop() {
    const { classes, model, editMode } = this.props;

    const rows = model.layoutData.caseOf({
      just: ld => ld.targetGroup.rows,
      nothing: () => Immutable.List<TG_COL>(),
    });

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    return (
      <div className={classes.dynaDropTable}>
        <p className={classes.instructions}>
          Each cell could either be a label or a drop target. Hover over a cell to specify its type.
          To assign matching, select each drop target cell and provide feedback
          (both correct and incorrect) for each option for the target cells.
        </p>
        <table>
          <thead>
            {rows.filter(row => row.contentType === 'HeaderRow').map(row => (
              <tr>
                {row.cols.toArray().map(col => col.contentType === 'Target'
                ? (
                  <DynaDropTarget
                    header className={classNames([classes.targetCell])} />
                )
                : (
                  <th
                    className={classes.header}
                    style={{
                      fontWeight: col.fontWeight as any,
                      fontSize: col.fontWeight,
                      fontStyle: col.fontStyle as any,
                      textDecoration: col.textDecoration,
                    }}>
                    {col.text}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.filter(row => row.contentType === 'ContentRow').toArray().map(row => (
              <tr>
                {row.cols.toArray().map(col => col.contentType === 'Target'
                  ? (
                    <DynaDropTarget className={classNames([classes.targetCell])} />
                  )
                  : (
                    <td
                      className={classNames([classes.cell])}
                      style={{
                        fontWeight: col.fontWeight as any,
                        fontSize: col.fontWeight,
                        fontStyle: col.fontStyle as any,
                        textDecoration: col.textDecoration,
                      }}>
                      {col.text}
                    </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <Button type="link" editMode={editMode}
            onClick={() => {}} >
            <i className="fa fa-plus" /> Add a Row
          </Button>
          <Button type="link" editMode={editMode}
            onClick={() => {}} >
            <i className="fa fa-plus" /> Add a Column
          </Button>
        </div>
        <div className={classes.initiators}>
          {initiators.map(initiator => (
            <Initiator model={initiator} editMode={editMode} onRemove={this.removeInitiator} />
          ))}
        </div>
        <div>
          <Button type="link" editMode={editMode}
            onClick={() => {}} >
            <i className="fa fa-plus" /> Add a Choice
          </Button>
        </div>
      </div>
    );
  }

  renderMain() : JSX.Element {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames([classes.customEditor, className])}>
        {model.src.substr(11) === 'DynaDrop.js'
          ? '[Custom Element]'
          : this.renderDynaDrop()
        }
      </div>
    );
  }
}
