import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { Tooltip } from 'utils/tooltip';

import { RemovableContent } from 'editors/content/common/RemovableContent';
import './styles.scss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { getEditorByContentType } from 'editors/content/container/registry';
import { accessStore } from 'utils/store';
import { InlineDisplayProps } from './common';
import * as editorUtils from '../utils';
import { Editor } from 'slate';

const Provider = (require('react-redux') as any).Provider;

interface ExtraProps extends InlineDisplayProps {
  parentProps: any;
  parent: any;
}

interface ExtraState {
  tooltipShown: boolean;
}

export class Extra extends React.PureComponent<ExtraProps, ExtraState> {

  constructor(props) {
    super(props);

    this.state = { tooltipShown: false };
  }

  onEdit(e, src) {
    const { node, editor } = this.props;
    editorUtils.updateInlineData(editor, node.key, e);
  }

  onClose() {
    this.setState({ tooltipShown: false });
  }

  onOpen() {
    this.setState({ tooltipShown: true });
  }

  render(): JSX.Element {

    const extra = this.props.node.data.get('value');
    const editor = getEditorByContentType('Extra');

    const props = Object.assign({}, this.props.parentProps, {
      renderContext: RenderContext.MainEditor,
      model: extra,
      onEdit: this.onEdit.bind(this),
      onClose: this.onClose.bind(this),
      parent: this.props.parent,
    });
    const editorComponent = React.createElement(editor, props);

    const closeable = (
      <Provider store={accessStore()}>
        <RemovableContent title="Rollover"
          onRemove={this.onClose.bind(this)} editMode={true} associatedClasses="">
          <div className="tooltip-editor">
            {editorComponent}
          </div>
        </RemovableContent>
      </Provider>
    );

    return (
      <Tooltip useContext={true}
        theme="light"
        interactive
        open={this.state.tooltipShown}
        trigger="click"
        hideOnClick="false"
        html={closeable}>
        <a className="oli-extra"
          {...this.props.attrs}
          onClick={this.onOpen.bind(this)}>
          {this.props.children}
        </a>
      </Tooltip>
    );
  }
}

