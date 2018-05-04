import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Tooltip } from 'utils/tooltip';

import { ContentState } from 'draft-js';
import { AppServices } from '../../../../common/AppServices';
import { RemovableContent } from 'editors/content/common/RemovableContent';
import './styles.scss';
import { RenderContext } from 'editors/content/common/AbstractContentEditor';
import { getEditorByContentType } from 'editors/content/container/registry';
import { ContiguousText } from 'data/content/learning/contiguous';

interface ExtraProps {
  services: AppServices;
  offsetKey: string;
  entityKey: string;
  parentProps: any;
  contentState: ContentState;
  parent: any;
  getContiguousText: () => ContiguousText;
  onContiguousTextEdit: (text: ContiguousText) => void;
}

interface ExtraState {
  tooltipShown: boolean;
}

class Extra extends React.PureComponent<ExtraProps, ExtraState> {

  constructor(props) {
    super(props);

    this.state = { tooltipShown: false };
  }

  onEdit(e, src) {

    const { getContiguousText, onContiguousTextEdit, entityKey } = this.props;

    // Update the entity inside the contiguous text
    const text = getContiguousText().updateEntity(entityKey, e);
    onContiguousTextEdit(text);
  }

  onClose() {
    this.setState({ tooltipShown: false });
  }

  onOpen() {
    this.setState({ tooltipShown: true });
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    const editor = getEditorByContentType('Extra');

    const props = Object.assign({}, this.props.parentProps, {
      renderContext: RenderContext.MainEditor,
      model: data as contentTypes.Extra,
      onEdit: this.onEdit.bind(this),
      parent: this.props.parent,
    });
    const editorComponent = React.createElement(editor, props);

    const closeable = (
      <RemovableContent title="Rollover"
        onRemove={this.onClose.bind(this)} editMode={true} associatedClasses="">
        <div className="tooltip-editor">
          {editorComponent}
        </div>
      </RemovableContent>
    );

    return (
      <Tooltip useContext={true}
        interactive
        open={this.state.tooltipShown}
        trigger="click"
        hideOnClick="false"
        html={closeable}>
        <a className="entity-extra"
          onClick={this.onOpen.bind(this)}
          data-offset-key={this.props.offsetKey}>
          {this.props.children}
        </a>
      </Tooltip>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.extra),
    component: Extra,
    props,
  };
}
