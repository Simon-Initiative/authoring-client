import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Example as ExampleType } from 'data/content/learning/example'; 
import { ContentContainer } from 'editors/content/container/ContentContainer.tsx';
import { Label } from '../common/Sidebar';
import { TextInput } from '../common/controls';
import { TitleContentEditor } from 'editors/content/title/TitleContentEditor.tsx';

export interface ExampleProps extends AbstractContentEditorProps<ExampleType> {

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

  onTitleEdit(title) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model, model);
  }

  onContentEdit(content) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, model);
  }

  renderSidebar() {
    return (
      <div>
        <Label>Title</Label>
        <TitleContentEditor
          {...this.props}
          model={this.props.model.title}
          onEdit={this.onTitleEdit}
        />
      </div>
    );
  }

  renderToolbar() {
    return <span>Example</span>;
  }

  renderMain(): JSX.Element {
    return (
      <div className="exampleEditor">
        <TitleContentEditor
          {...this.props}
          model={this.props.model.title}
          onEdit={this.onTitleEdit}
        />
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onContentEdit}
        />
      </div>
    );
  }
}
