import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { Select, TextInput } from 'editors/content/common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { CommandType, CommandStyle } from 'data/content/learning/command';
import {
  selectTargetElement,
} from 'components/message/selection';
import '../common/draft/decorators/styles.scss';
import { IdentifiableContentElement } from 'data/content/common/interfaces';

export interface CommandEditorProps
  extends AbstractContentEditorProps<contentTypes.Command> {
  onShowSidebar: () => void;

}

interface Pending {
  type: 'Pending';
}
interface Found {
  type: 'Found';
  element: IdentifiableContentElement;
}
interface NotFound {
  type: 'NotFound';
}

type ElementFetchRequest = Pending | Found | NotFound;

export interface CommandEditorState {
  targetRequest: ElementFetchRequest;
}

/**
 * React Component
 */
export default class CommandEditor
  extends AbstractContentEditor
  <contentTypes.Command, CommandEditorProps & JSSProps, CommandEditorState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onMessageEdit = this.onMessageEdit.bind(this);
    this.onSelectTarget = this.onSelectTarget.bind(this);

    this.state = {
      targetRequest: { type: 'Pending' },
    };
  }

  componentDidMount() {
    if (this.props.renderContext === RenderContext.Sidebar) {
      this.fetchTargetContentElement(this.props.model.target);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.state.targetRequest !== nextState.targetRequest;
  }

  componentWillReceiveProps(nextProps: CommandEditorProps) {
    if (this.props.model.target !== nextProps.model.target
      && this.props.renderContext === RenderContext.Sidebar) {
      this.fetchTargetContentElement(nextProps.model.target);
    }
  }

  fetchTargetContentElement(target) {
    const fetch = () => this.props.services.fetchContentElementById(
      this.props.context.documentId, target)
      .then((result) => {
        result.caseOf({
          just: (element) => {
            this.setState({
              targetRequest: { type: 'Found', element: element as IdentifiableContentElement },
            });
          },
          nothing: () => {
            this.setState({
              targetRequest: { type: 'NotFound' },
            });
          },
        });
      });

    this.setState({ targetRequest: { type: 'Pending' } }, fetch);
  }

  onTitleEdit(title) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model, model);
  }

  onMessageEdit(text) {
    const message = this.props.model.message.with({ text });
    const model = this.props.model.with({ message });
    this.props.onEdit(model, model);
  }

  onSelectTarget() {
    selectTargetElement()
      .then((e) => {
        e.lift((element) => {
          const model = this.props.model.with({ target: element.id });
          this.props.onEdit(model, model);
        });
      });
  }

  renderMain() {

    const linkOrButton = this.props.model.style === CommandStyle.Button
      ? 'btn btn-primary'
      : 'btn btn-link';

    return (
      <div style={{ paddingLeft: '15px' }}>
        <button type="button" className={linkOrButton}>
          {this.props.model.title}
        </button>
      </div>
    );
  }

  renderSidebar() {
    const { editMode, model, onEdit } = this.props;

    let targetDisplay;

    if (this.state.targetRequest.type === 'Pending') {
      targetDisplay = null;
    } else if (this.state.targetRequest.type === 'NotFound') {
      targetDisplay = <div>Unknown</div>;
    } else {
      targetDisplay = <div>{this.state.targetRequest.element.contentType}</div>;
    }

    return (
      <SidebarContent title="Command">
        <SidebarGroup label="Label">
          <TextInput
            editMode={editMode}
            width="100%"
            label=""
            value={model.title}
            type="string"
            onEdit={this.onTitleEdit}
          />
        </SidebarGroup>
        <SidebarGroup label="Target">
          {targetDisplay}
          <div>
            <button type="button" className="btn btn-primary" onClick={this.onSelectTarget}>
              Select Target
            </button>
          </div>
        </SidebarGroup>
        <SidebarGroup label="Type">
          <Select
            editMode={editMode}
            label=""
            value={model.commandType}
            onChange={(commandType: CommandType) => onEdit(model.with({ commandType }))}>
            <option key={CommandType.Message} value={CommandType.Message}>Message</option>
            <option key={CommandType.Broadcast} value={CommandType.Broadcast}>Broadcast</option>
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Style">
          <Select
            editMode={editMode}
            label=""
            value={model.style}
            onChange={(style: CommandStyle) => onEdit(model.with({ style }))}>
            <option key={CommandStyle.Button} value={CommandStyle.Button}>Button</option>
            <option key={CommandStyle.Link} value={CommandStyle.Link}>Link</option>
          </Select>
        </SidebarGroup>
        <SidebarGroup label="Message">
          <TextInput
            editMode={editMode}
            width="100%"
            label=""
            value={model.message.text}
            type="string"
            onEdit={this.onMessageEdit}
          />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Command" columns={4} highlightColor={CONTENT_COLORS.Command}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-sliders" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }
}
