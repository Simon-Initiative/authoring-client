import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps, RenderContext }
  from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { ContiguousText } from 'data/content/learning/contiguous';
import BlockFormulaToolbar from './BlockFormulaToolbar.controller';

import styles from './BlockFormula.style';

export interface BlockFormulaProps
  extends AbstractContentEditorProps<contentTypes.BlockFormula> {
  onShowSidebar: () => void;
}

export interface BlockFormulaState {

}

@injectSheet(styles)
export class BlockFormula
    extends AbstractContentEditor
    <contentTypes.BlockFormula, BlockFormulaProps & JSSProps, BlockFormulaState> {

  constructor(props) {
    super(props);

    this.onEditText = this.onEditText.bind(this);
    this.onFocusOverride = this.onFocusOverride.bind(this);
  }

  onEditText(text: ContiguousText, source) {
    const model = this.props.model.with({ text });
    this.props.onEdit(model, model);
  }

  onFocusOverride(model, parent, selection) {
    this.props.onFocus(this.props.model, this.props.parent, selection);
  }

  renderSidebar() {
    return <BlockFormulaToolbar {...this.props} renderContext={RenderContext.Sidebar} />;
  }

  renderToolbar() {
    return <BlockFormulaToolbar {...this.props} renderContext={RenderContext.Toolbar} />;
  }

  renderMain() {
    const { classes } = this.props;

    return (
      <div className={classNames(['formulaEditor', classes.formulaEditor])}>
        <div className={classes.formulaWrapper}>
          <ContiguousTextEditor
            {...this.props}
            onFocus={this.onFocusOverride}
            model={this.props.model.text}
            onEdit={this.onEditText}>
          </ContiguousTextEditor>
        </div>
      </div>
    );
  }
}
