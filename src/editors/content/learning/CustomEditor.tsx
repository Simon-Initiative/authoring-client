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
import { DragHandle } from 'components/common/DragHandle';

import { styles } from './CustomEditor.styles';
import { Initiator } from 'data/content/assessment/dragdrop/initiator';

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
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Audio} columns={4}>
      </ToolbarGroup>
    );
  }

  renderDynaDrop() {
    const { classes, model } = this.props;

    const rows = model.layoutData.caseOf({
      just: ld => ld.targetGroup.rows,
      nothing: () => Immutable.List<TG_COL>(),
    });

    const initiators = model.layoutData.caseOf({
      just: ld => ld.initiatorGroup.initiators,
      nothing: () => Immutable.List<Initiator>(),
    });

    return (
      <div className={classes.dynaDropTable}>
        <table>
          <thead>
            {rows.filter(row => row.contentType === 'HeaderRow').map(row => (
              <tr>
                {row.cols.toArray().map(col => col.contentType === 'Target'
                ? (
                  <th className={classNames([classes.cell, classes.targetCell])} />
                )
                : (
                  <th style={{
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
                    <td className={classNames([classes.cell, classes.targetCell])} />
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
        <div className={classes.initiators}>
          {initiators.map(initiator => (
            <div
              className={classNames([classes.initiator])}
              style={{
                fontWeight: initiator.fontWeight as any,
                fontSize: initiator.fontWeight,
                fontStyle: initiator.fontStyle as any,
                textDecoration: initiator.textDecoration,
              }}>
              <DragHandle />
              {initiator.text}
            </div>
          ))}
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
