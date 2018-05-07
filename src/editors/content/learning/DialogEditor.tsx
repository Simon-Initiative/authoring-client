import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
// import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './nested.scss';
import { ContentElements } from 'data/content/common/elements';

export interface DialogEditorProps extends AbstractContentEditorProps<contentTypes.Dialog> {
  onShowSidebar: () => void;
}

export interface DialogEditorState {

}

export default class DialogEditor
  extends AbstractContentEditor<contentTypes.Dialog, DialogEditorProps, DialogEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {
    const oldTitle = this.props.model.title;
    const title = oldTitle.with({
      text: oldTitle.text.with({
        content: oldTitle.text.content.set(ct.guid, ct),
      }),
    });

    const model = this.props.model.with({ title });

    this.props.onEdit(model, sourceObject);
  }

  onBodyEdit(body: ContentElements, sourceObject) {
    // const media = body.content.first() as MediaItem;
    // const model = this.props.model.with({ media: Maybe.just(media) });
    // this.props.onEdit(model, sourceObject);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Dialog" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Dialog" columns={2} highlightColor={CONTENT_COLORS.Dialog}>
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
          {this.props.model.media.lift((media) => {
            // <ContentContainer
            //   {...this.props}
            //   model={new ContentElements().with({ content: media })}
            //   onEdit={this.onBodyEdit}
            // />;
          })}

        </div>
      </div>
    );
  }
}
