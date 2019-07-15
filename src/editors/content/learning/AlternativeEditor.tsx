import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TextInput } from '../common/controls';
import { Maybe } from 'tsmonad';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { ContiguousText } from 'data/content/learning/contiguous';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './Alternatives.styles';

export interface AlternativeEditorProps
  extends AbstractContentEditorProps<contentTypes.Alternative> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface AlternativeEditorState {

}

class AlternativeEditor
  extends AbstractContentEditor<contentTypes.Alternative,
  StyledComponentProps<AlternativeEditorProps, typeof styles>, AlternativeEditorState> {

  constructor(props) {
    super(props);
  }

  onAltEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  onValueEdit(value: string) {
    const spacesStripped = value.replace(/\s+/g, '');
    const model = this.props.model.with({ value: spacesStripped });
    this.props.onEdit(model, model);
  }

  /**
   * Note that for this soution, we must use a Title Editor
   * This is called when the user edits the Title via the Title Editor
   */
  onTitleEdit(ct: ContiguousText, sourceObject) {
    const content = this.props.model.title.text.content.set(ct.guid, ct);
    const text = this.props.model.title.text.with({ content });
    const title = this.props.model.title.with({ text });
    const model = this.props.model.with({ title });
    this.props.onEdit(model, sourceObject);
  }

  /**
   * This is called when the user edits the Title via the sidebar (for design consistency)
   * @param titleText
   */
  onSideTitleEdit(titleText: string) {
    const title = new contentTypes.Title({
      text: ContentElements.fromText(titleText, '', TEXT_ELEMENTS),
    });

    const model = this.props.model.with({ title });
    this.props.onEdit(model, model);

  }

  renderSidebar() {
    const { model, editMode } = this.props;

    // must be stripped out of the Title object
    const titleText = model.title.text.extractPlainText().caseOf({
      just: t => t,
      nothing: () => '',
    });

    return (
      <SidebarContent title={model.value}>
        <SidebarGroup label="Label">
          <Discoverable id={DiscoverableId.AlternativeEditorKey} focusChild>
            <TextInput
              editMode={editMode}
              value={model.value}
              type="text"
              width="100%"
              label=""
              onEdit={this.onValueEdit.bind(this)}
            />
          </Discoverable>
        </SidebarGroup>
        <SidebarGroup label="Title">
          <Discoverable id={DiscoverableId.AlternativeEditorKey} focusChild>
            <TextInput
              editMode={editMode}
              value={titleText}
              type="text"
              width="100%"
              label=""
              onEdit={this.onSideTitleEdit.bind(this)}
            />
          </Discoverable>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, onDiscover, model } = this.props;

    return (
      <ToolbarGroup label={model.value} columns={5} highlightColor={CONTENT_COLORS.CellData}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.AlternativeEditorKey);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-align-left"></i></div>
          <div>Key</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { className, classes, model, parent } = this.props;

    return (
      <div className={classNames([classes.alternative, className])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        {/* FIXME: for some reason, this Title value changes
        when the "model.value" is edited via the Sidebar */}
        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={(this.props.model.title.text.content.first() as ContiguousText)}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit.bind(this)}
        editorStyles={{ fontSize: 20, fontWeight: 600 }} />

        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onAltEdit.bind(this)}
        />
      </div>
    );
  }

}

const StyledAlternativeEditor = withStyles<AlternativeEditorProps>(styles)(AlternativeEditor);
export default StyledAlternativeEditor;
