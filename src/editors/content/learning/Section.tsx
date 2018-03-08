import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/controls';
import { Label } from '../common/Sidebar';
import { TitleContentEditor } from 'editors/content/title//TitleContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { Maybe } from 'tsmonad';
import { Section as SectionType } from 'data/content/workbook/section';
import { PurposeTypes } from 'data/content/learning/common';

export interface SectionProps extends AbstractContentEditorProps<SectionType> {

}

export interface SectionState {

}

export class Section extends AbstractContentEditor<SectionType, SectionProps, SectionState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onPurposeChange = this.onPurposeChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }
  
  onTitleEdit(title) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model, model);
  }

  onBodyEdit(body) {
    const model = this.props.model.with({ body });
    this.props.onEdit(model, model);
  }

  onPurposeChange(purpose) {
    const model = this.props.model.with({
      purpose: purpose === ''
        ? Maybe.nothing()
        : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
  }

  renderSidebar(): JSX.Element {
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

  renderToolbar(): JSX.Element {
    return (
      <div>
        <Label>Purpose</Label>
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
      </div>
    );
  }

  renderMain(): JSX.Element {
    return (
    <div className="pulloutEditor">
      <TitleContentEditor
        {...this.props}
        model={this.props.model.title}
        onEdit={this.onTitleEdit}
      />
      <Label>Content</Label>
      <ContentContainer
        {...this.props}
        model={this.props.model.body}
        onEdit={this.onBodyEdit}
      />
    </div>
    );
  }
}
