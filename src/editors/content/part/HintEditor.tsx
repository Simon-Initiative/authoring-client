import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { InputLabel } from '../common/InputLabel';


type IdTypes = {
  targets: string,
};

export interface HintEditorProps extends AbstractContentEditorProps<contentTypes.Hint> {
  onRemove: (hint: contentTypes.Hint) => void;
}

export interface HintEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class HintEditor
  extends AbstractContentEditor<contentTypes.Hint, HintEditorProps, HintEditorState> {
  ids: IdTypes;

  constructor(props) {
    super(props);

    this.ids = {
      targets: guid(),
    };
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onTargetChange = this.onTargetChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({ body });
    this.props.onEdit(concept);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ targets: nextProps.model.targets });
  }

  onTargetChange(e) {
    const targets = e.target.value;
    this.setState({ targets }, () =>
      this.props.onEdit(this.props.model.with({ targets })));
  }

  render() : JSX.Element {

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const insertionToolbar = <InlineInsertionToolbar/>;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    return (
      <div className="itemWrapper">

      <InputLabel editMode={this.props.editMode}
        label="Hint" style="default" onRemove={this.props.onRemove.bind(this, this.props.model)}>
          <HtmlContentEditor
            editorStyles={bodyStyle}
            inlineToolbar={inlineToolbar}
            blockToolbar={blockToolbar}
            inlineInsertionToolbar={insertionToolbar}
            {...this.props}
            model={this.props.model.body}
            onEdit={this.onBodyEdit}
            />
        </InputLabel>

      </div>);
  }

}

