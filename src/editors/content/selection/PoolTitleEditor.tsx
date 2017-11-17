import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

export interface PoolTitleEditorProps extends AbstractContentEditorProps<contentTypes.Title> {

}

export class PoolTitleEditor
  extends AbstractContentEditor<contentTypes.Title, PoolTitleEditorProps, { text }> {

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);

    this.state = {
      text: this.props.model.text,
    };
  }

  onChange() {

    const text = ((this.refs as any).text as any).innerHTML;
    this.setState(
      { text },
      () => {
        const updatedContent : contentTypes.Title = this.props.model.with({ text });
        this.props.onEdit(updatedContent);
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.model.text !== this.state.text;
  }

  renderView(): JSX.Element {
    if (this.props.styles) {
      return <div style={this.props.styles}>{this.props.model.text}</div>;
    }

    return <div>{this.props.model.text}</div>;
  }

  renderEdit(): JSX.Element {
    const html = { __html: this.state.text };
    const styles = {
      backgroundColor: '#FFFFFF',
      padding: '10px',
      fontSize: '12pt',
    };
    return <h5
        ref="text" onInput={this.onChange}
        style={ styles }
        contentEditable dangerouslySetInnerHTML={html}>
      </h5>;
  }

  render() : JSX.Element {
    if (this.props.editMode) {
      return this.renderEdit();
    } else {
      return this.renderView();
    }
  }

}

