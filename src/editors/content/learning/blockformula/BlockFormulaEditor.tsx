import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps, RenderContext }
  from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from 'editors/content/learning/contiguoustext/ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import BlockFormulaToolbar from './BlockFormulaToolbar.controller';
import { styles } from './BlockFormula.styles';
import { StyledComponentProps } from 'types/component';

export interface BlockFormulaEditorProps
  extends AbstractContentEditorProps<contentTypes.BlockFormula> {
  onShowSidebar: () => void;
}

export interface BlockFormulaEditorState {

}

class BlockFormulaEditor
    extends AbstractContentEditor
    <contentTypes.BlockFormula, StyledComponentProps<BlockFormulaEditorProps, typeof styles>,
    BlockFormulaEditorState> {

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
            onInsertParsedContent={() => {}}
            onFocus={this.onFocusOverride}
            model={this.props.model.text}
            onEdit={this.onEditText}>
          </ContiguousTextEditor>
        </div>
      </div>
    );
  }
}

const StyledBlockFormulaEditor = withStyles<BlockFormulaEditorProps>(styles)(BlockFormulaEditor);
export default StyledBlockFormulaEditor;
