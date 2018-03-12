import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Example as ExampleType } from 'data/content/learning/example';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import colors from 'styles/colors';

export interface ExampleProps extends AbstractContentEditorProps<ExampleType> {
  onShowSidebar: () => void;
}

export interface ExampleState {

}

export class Example extends AbstractContentEditor<ExampleType, ExampleProps, ExampleState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }

  onTitleEdit(title, sourceObject) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model, sourceObject);
  }

  onContentEdit(content, sourceObject) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, sourceObject);
  }

  renderSidebar(): JSX.Element {
    const { model } = this.props;

    return (
      <SidebarContent title="Example">
        <SidebarGroup label="Title">
          <ToolbarContentContainer
            {...this.props}
            model={model.title.text}
            onEdit={text => this.onTitleEdit(model.title.with({ text }), model)} />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Example" highlightColor={colors.contentSelection}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return (
      <div className="exampleEditor">
        <h5>{this.props.model.title.text.extractPlainText().valueOr(null)}</h5>
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onContentEdit}
        />
      </div>
    );
  }
}
