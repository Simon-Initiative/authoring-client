import * as React from 'react';
import * as persistence from '../../../data/persistence';
import { Xref } from '../../../data/content/workbook/xref';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/Select';
import { InputLabel } from '../common/InputLabel';
import { TextInput } from '../common/TextInput';

export interface XrefEditorProps extends AbstractContentEditorProps<Xref> {

}

export interface XrefEditorState {
  resources: persistence.CourseResource[];
  selectedGuid: string;
}

/**
 * The content editor for Table.
 */
export class XrefEditor
  extends AbstractContentEditor<Xref, XrefEditorProps, XrefEditorState> {

  constructor(props) {
    super(props);

    this.onTargetEdit = this.onTargetEdit.bind(this);
    this.onIdrefEdit = this.onIdrefEdit.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    const selected = this.props.context.courseModel
      .resources.toArray().find(r => r.id === this.props.model.page);

    this.state = {
      resources: [],
      selectedGuid: selected !== undefined ? selected.guid : null,
    };
  }

  componentDidMount() {
    persistence.fetchCourseResources(this.props.context.courseId)
    .then(resources => this.setState({ resources }));
  }

  shouldComponentUpdate(nextProps, nextState: XrefEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextState.resources !== this.state.resources) {
      return true;
    }
    return false;
  }

  onTargetEdit(target) {
    this.props.onEdit(this.props.model.with({ target }));
  }

  onPageEdit(guid) {
    this.props.services.fetchIdByGuid(guid)
      .then(idref => this.props.onEdit(this.props.model.with({ idref })));
  }

  onIdrefEdit(idref) {
    this.props.onEdit(this.props.model.with({ idref }));
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const { target } = this.props.model;

    return (
      <div className="itemWrapper">

        <InputLabel label="Page">
          <Select
            editMode={this.props.editMode}
            label=""
            value={this.state.selectedGuid}
            onChange={this.onPageEdit}>
            {this.state.resources.map(a => <option value={a._id}>{a.title}</option>)}
          </Select>
        </InputLabel>

        <InputLabel label="Reference">
          <TextInput
            editMode={this.props.editMode}
            width="300px"
            type="text"
            label=""
            value={this.props.model.idref}
            onEdit={this.onIdrefEdit}>
          </TextInput>
        </InputLabel>

        <InputLabel label="Target">
          <Select
            editMode={this.props.editMode}
            label=""
            value={target}
            onChange={this.onTargetEdit}>
            <option value="new">Open in new tab/window</option>
            <option value="self">Open in this window</option>
          </Select>
        </InputLabel>

      </div>);
  }

}

