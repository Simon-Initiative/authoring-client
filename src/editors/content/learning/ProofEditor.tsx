import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import { Select } from 'editors/content/common/controls';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './Theorem.styles';
import { Tombstone } from 'data/content/learning/proof';

export interface ProofEditorProps
  extends AbstractContentEditorProps<contentTypes.Proof> {
  onShowSidebar: () => void;

}

export interface ProofEditorState {

}

class ProofEditor
  extends AbstractContentEditor<contentTypes.Proof,
  StyledComponentProps<ProofEditorProps, typeof styles>, ProofEditorState> {

  constructor(props) {
    super(props);

    this.onTombstoneChange = this.onTombstoneChange.bind(this);
  }


  onTombstoneChange(tombstone) {
    const model = this.props.model.with({
      tombstone,
    });
    this.props.onEdit(model, model);
  }


  renderSidebar() {
    return (
      <SidebarContent title="Proof" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Proof" columns={5} highlightColor={CONTENT_COLORS.Proof}>
        <ToolbarLayout.Column>
          <span>Tombstone</span>
          <Select editMode={this.props.editMode}
            value={this.props.model.tombstone}
            onChange={this.onTombstoneChange}>
            <option value={Tombstone.None}>None</option>
            <option value={Tombstone.BlackSquare}>Black square</option>
            <option value={Tombstone.HollowBlackSquare}>Hollow black square</option>
            <option value={Tombstone.QED}>QED</option>
            <option value={Tombstone.QEF}>QEF</option>
          </Select>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }


  onProofEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;

    return (
      <div className={classNames([classes.proof, className])}>
        <div className={classNames([classes.proofLabel, className])}>Proof</div>
        <div className={classNames([classes.proofContent, className])}>
          <ContentContainer
            {...this.props}
            model={model.content}
            onEdit={this.onProofEdit.bind(this)}
          />
        </div>
      </div>
    );
  }
}

const StyledProofEditor = withStyles<ProofEditorProps>(styles)(ProofEditor);
export default StyledProofEditor;
