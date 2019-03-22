import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentElements } from 'data/content/common/elements';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select } from 'editors/content/common/controls';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { PurposeTypes } from 'data/content/learning/common';

import { Maybe } from 'tsmonad';

import { styles } from 'editors/content/learning/Composite.styles';

export interface CompositeEditorProps
  extends AbstractContentEditorProps<contentTypes.Composite> {
  onShowSidebar: () => void;
}

export interface CompositeEditorState {

}

/**
 * The content editor for Composites.
 */
class CompositeEditor
  extends AbstractContentEditor<contentTypes.Composite,
  StyledComponentProps<CompositeEditorProps, typeof styles>, CompositeEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddInstructions = this.onAddInstructions.bind(this);
    this.onPurposeChange = this.onPurposeChange.bind(this);
    this.onInstructionsEdit = this.onInstructionsEdit.bind(this);
    this.onEdit = this.onEdit.bind(this);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Composite Activity" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Composite Activity"
        columns={7} highlightColor={CONTENT_COLORS.Composite}>
        <ToolbarLayout.Column>
          <div style={{ marginLeft: 8 }}>Purpose</div>
          <Select
            editMode={this.props.editMode}
            label=""
            value={this.props.model.purpose.caseOf({
              nothing: () => '',
              just: p => p,
            })}
            onChange={this.onPurposeChange}>
            <option value={''}>
              {''}
            </option>
            {PurposeTypes.map(p =>
              <option
                key={p.value}
                value={p.value}>
                {p.label}
              </option>)}
          </Select>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  onAddInstructions() {

    const instructions = new contentTypes.Instructions();
    const model = this.props.model.with({
      instructions: Maybe.just(instructions),
    });

    this.props.onEdit(model, instructions);
  }

  onInstructionsEdit(instructions, src) {

    if (instructions.content.size === 0) {
      const model = this.props.model.with({
        instructions: Maybe.nothing(),
      });

      this.props.onEdit(model, src);
    } else {
      const model = this.props.model.with({
        instructions: Maybe.just(instructions.content.first()),
      });

      this.props.onEdit(model, src);
    }
  }

  onEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {

    const currentTitle = this.props.model.title.caseOf({
      just: title => title,
      nothing: () => new contentTypes.Title(),
    });
    const content = currentTitle.text.content.set(ct.guid, ct);
    const text = currentTitle.text.with({ content });
    const title = currentTitle.with({ text });
    const model = this.props.model.with({ title: Maybe.just(title) });
    this.props.onEdit(model, sourceObject);
  }

  onPurposeChange(purpose) {
    const model = this.props.model.with({
      purpose: purpose === ''
        ? Maybe.nothing()
        : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
  }

  renderMain(): JSX.Element {

    const { className, classes, model, editMode } = this.props;

    const canAddInstructions = model.instructions.caseOf({
      just: n => false,
      nothing: () => true,
    });

    const instructions = new ContentElements().with({
      content: model.instructions.caseOf({
        just: p => Immutable.OrderedMap<string, ContentElement>().set(p.guid, p),
        nothing: () => Immutable.OrderedMap<string, ContentElement>(),
      }),
    });

    const instructionsEditor = model.instructions.caseOf({
      just: p => <ContentContainer
        {...this.props}
        model={instructions}
        onEdit={this.onInstructionsEdit.bind(this)}
      />,
      nothing: () => null,
    });

    const currentTitle = this.props.model.title.caseOf({
      just: title => title,
      nothing: () => contentTypes.Title.fromText(''),
    });

    return (
      <div className={classNames([classes.composite, className])}>

        <TitleTextEditor
          {...this.props}
          model={(currentTitle.text.content.first() as ContiguousText)}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />

        {instructionsEditor}

        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onEdit.bind(this)}
        />

        <button type="button"
          disabled={!editMode || !canAddInstructions}
          onClick={this.onAddInstructions.bind(this)}
          className="btn btn-link">+ Add instructions</button>
      </div>
    );
  }
}

const StyledCompositeEditor = withStyles<CompositeEditorProps>(styles)(CompositeEditor);
export default StyledCompositeEditor;
