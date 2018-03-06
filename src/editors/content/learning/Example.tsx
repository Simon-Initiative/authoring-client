import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Example as ExampleType } from 'data/content/learning/example'; 
import { ContentEditor } from 'editors/content/content/ContentEditor';
import { Label } from '../common/Sidebar';
import { TextInput } from '../common/controls';

export interface ExampleProps extends AbstractContentEditorProps<ExampleType> {

}

export interface ExampleState {

}

export class Example extends AbstractContentEditor<ExampleType, ExampleProps, ExampleState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
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
        <TextInput
          editMode={this.props.editMode]}
          width="100%"
          type="text"
          label=""
          value={this.props.model.title}
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
      <ContentEditor
        model={this.props.model}
        onEdit={this.onContentEdit}
        onFocus={this.onFocus}
        onRemove={}
        context={this.props.context}
        services={this.props.services}
        editMode
      />
    );
  }
}
