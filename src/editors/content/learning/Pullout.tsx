import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Pullout as PulloutType } from 'data/content/learning/pullout';
import { Select, Checkbox } from '../common/controls';
import { Label } from '../common/Sidebar';
import { TitleContentEditor } from 'editors/content/title//TitleContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { Maybe } from 'tsmonad';
import { Orientation } from 'data/content/learning/common';

export interface PulloutProps extends AbstractContentEditorProps<PulloutType> {

}

export interface PulloutState {

}

export class Pullout extends AbstractContentEditor<PulloutType, PulloutProps, PulloutState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
    this.onPulloutTypeChange = this.onPulloutTypeChange.bind(this);
    this.onEditOrient = this.onEditOrient.bind(this);
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

  onPulloutTypeChange(pulloutType) {
    const model = this.props.model.with({
      pulloutType: pulloutType === ''
        ? Maybe.nothing()
        : Maybe.just(pulloutType),
    });
    this.props.onEdit(model, model);
  }

  onEditOrient(isVertical) {
    const model = this.props.model.with({
      orient: isVertical
        ? Orientation.Vertical
        : Orientation.Horizontal,
    });
    this.props.onEdit(model, model);
  }

  isOrientVertical() {
    return this.props.model.orient === Orientation.Vertical;
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
        <Select editMode={this.props.editMode}
          value={this.props.model.pulloutType.caseOf({
            nothing: () => '',
            just: t => t,
          })}
          onChange={this.onPulloutTypeChange}>
          <option value="">Pullout Type</option>
          <option value="note">Note</option>
          <option value="notation">Notation</option>
          <option value="observation">Observation</option>
          <option value="research">Research</option>
          <option value="tip">Tip</option>
          <option value="tosumup">To Sum Up</option>
        </Select>
        <Checkbox
          editMode={this.props.editMode}
          label="Vertical"
          value={this.isOrientVertical()}
          onEdit={this.onEditOrient}
        />
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
      <ContentContainer
        {...this.props}
        model={this.props.model.content}
        onEdit={this.onContentEdit}
      />
    </div>
    );
  }
}
