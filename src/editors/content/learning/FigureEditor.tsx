import * as React from 'react';
import * as Immutable from 'immutable';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Maybe } from 'tsmonad';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';

import './nested.scss';

export interface FigureEditorProps extends AbstractContentEditorProps<contentTypes.Figure> {
  onShowSidebar: () => void;
}

export interface FigureEditorState {

}

export default class FigureEditor
  extends AbstractContentEditor<contentTypes.Figure, FigureEditorProps, FigureEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);

    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.onCitationTitleEdit = this.onCitationTitleEdit.bind(this);
    this.onCitationEntryEdit = this.onCitationEntryEdit.bind(this);
    this.onCitationContentEdit = this.onCitationContentEdit.bind(this);
  }

  onTitleEdit(ct: ContiguousText, src) {
    const oldTitle = this.props.model.title;
    const title = oldTitle.with({
      text: oldTitle.text.with({
        content: oldTitle.text.content.set(ct.guid, ct),
      }),
    });

    const model = this.props.model.with({ title });

    this.props.onEdit(model, src);
  }

  onContentEdit(content: ContentElements, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.caseOf({
      just: caption => caption.with({ content }),
      nothing: () => new contentTypes.Caption().with({ content }),
    });
    const model = this.props.model.with({ caption: Maybe.just(caption) });
    this.props.onEdit(model, src);
  }

  onCitationTitleEdit(title: string) {
    const cite = this.props.model.cite.caseOf({
      just: cite => cite.with({ title }),
      nothing: () => new contentTypes.Cite().with({ title }),
    });
    const model = this.props.model.with({ cite: Maybe.just(cite) });
    this.props.onEdit(model, model);
  }

  onCitationEntryEdit(entry: string) {
    const cite = this.props.model.cite.caseOf({
      just: cite => cite.with({ entry }),
      nothing: () => new contentTypes.Cite().with({ entry }),
    });
    const model = this.props.model.with({ cite: Maybe.just(cite) });
    this.props.onEdit(model, model);
  }

  onCitationContentEdit(content: ContentElements, src) {
    const cite = this.props.model.cite.caseOf({
      just: cite => cite.with({ content }),
      nothing: () => new contentTypes.Cite().with({ content }),
    });
    const model = this.props.model.with({ cite: Maybe.just(cite) });
    this.props.onEdit(model, src);
  }

  renderSidebar(): JSX.Element {
    const { model } = this.props;
    const { caption } = model;

    return (
      <SidebarContent title="Figure">
        {/* Temporarily commenting out Citation editor until citation design is finalized */}
        {/* <SidebarGroup label="Citation">
          <TextInput width="100%" label="Title"
            editMode={this.props.editMode}
            value={cite.caseOf({
              just: cite => cite.title,
              nothing: () => '',
            })}
            type="text"
            onEdit={this.onCitationTitleEdit} />
          <TextInput width="100%" label="Entry"
            editMode={editMode}
            value={cite.caseOf({
              just: cite => cite.entry,
              nothing: () => '',
            })}
            type="text"
            onEdit={this.onCitationEntryEdit} />
          <ContentContainer
            {...this.props}
            renderContext={undefined}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => { }}
            model={cite.caseOf({
              just: cite => cite.content,
              nothing: () => new ContentElements().with({
                supportedElements: Immutable.List(TEXT_ELEMENTS),
              }),
            })}
            onEdit={this.onCitationContentEdit} />
        </SidebarGroup> */}
        <SidebarGroup label="Caption">
          <ToolbarContentContainer
            {...this.props}
            renderContext={undefined}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => { }}
            model={caption.caseOf({
              just: caption => caption.content,
              nothing: () => new ContentElements().with({
                supportedElements: Immutable.List(INLINE_ELEMENTS),
              }),
            })}
            onEdit={this.onCaptionEdit} />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Figure" columns={3} highlightColor={CONTENT_COLORS.Figure}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.props.onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return (
      <div>
        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={this.props.model.title.text.content.first() as ContiguousText}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />

        <div className="nested-container">
          <ContentContainer
            {...this.props}
            model={this.props.model.content}
            onEdit={this.onContentEdit}
          />
        </div>
      </div>
    );
  }
}
