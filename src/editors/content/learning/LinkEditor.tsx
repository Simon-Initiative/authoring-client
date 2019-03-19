import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { LinkTarget } from 'data/content/learning/common';
import { Select, TextInput } from 'editors/content/common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { modalActions } from 'actions/modal';
import { selectFile } from 'editors/content/learning/file';

export interface LinkEditorProps extends AbstractContentEditorProps<contentTypes.Link> {
  onShowSidebar: () => void;
}

export interface LinkEditorState {
  isExternal: boolean;
}

/**
 * React Component
 */
export default class LinkEditor
  extends AbstractContentEditor<contentTypes.Link, LinkEditorProps & JSSProps, LinkEditorState> {

  constructor(props: LinkEditorProps) {
    super(props);

    this.state = {
      isExternal: !props.model.href.startsWith('..'),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const doesSuperWantToUpdate = super.shouldComponentUpdate(nextProps, nextState);
    return doesSuperWantToUpdate || this.state.isExternal !== nextState.isExternal;
  }

  renderMain() {
    return null;
  }

  renderSideBarExternal() {
    const { editMode, model, onEdit } = this.props;

    const isMissingScheme = !(
      model.href.startsWith('mailto://') ||
      model.href.startsWith('ftp://') ||
      model.href.startsWith('http://') ||
      model.href.startsWith('https://')
    );

    const missingSchemeMessage = isMissingScheme
      ? <span style={{ color: 'darkred' }}>URLs should begin with <code>https://</code></span>
      : null;

    return (
      <React.Fragment>

        <SidebarGroup label="URL">

          {missingSchemeMessage}

          <TextInput
            editMode={editMode}
            width="100%"
            label=""
            hasError={isMissingScheme}
            value={model.href}
            type="string"
            onEdit={href => onEdit(model.with({ href }))}
          />
        </SidebarGroup>

        <SidebarGroup label="Target">
          <Select
            editMode={editMode}
            value={model.target}
            onChange={v =>
              onEdit(model.with({ target: v === 'self' ? LinkTarget.Self : LinkTarget.New }))}>
            <option value={LinkTarget.Self}>Open in this window</option>
            <option value={LinkTarget.New}>Open in new window</option>
          </Select>
        </SidebarGroup>

      </React.Fragment>
    );
  }


  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectFile(
      model.href,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((href) => {
        if (href !== null) {
          const updated = model.with({ href });
          onEdit(updated, updated);
        }
      });
  }

  renderFileLabel(filename: string) {

    const extension = filename.indexOf('.') !== -1
      ? filename.substr(filename.indexOf('.') + 1)
      : '';

    let icon = '';

    switch (extension) {
      case 'java':
      case 'cpp':
      case 'cs':
      case 'cxx':
      case 'php':
      case 'pl':
      case 'py':
      case 'js':
      case 'c':
      case 'rb':
      case 'xml':
      case 'html':
      case 'ml':
        icon = 'code-o';
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        icon = 'photo-o';
        break;
      case 'mov':
      case 'avi':
      case 'mp4':
      case 'wmv':
        icon = 'movie-o';
        break;
      case 'mp3':
      case 'wav':
      case 'aiff':
      case 'ogg':
      case 'wma':
        icon = 'sound-o';
        break;
      case 'zip':
      case 'tar':
      case 'rar':
      case '7z':
      case 'iso':
        icon = 'archive-o';
        break;
      case 'xls':
      case 'xlsx':
      case 'xlsm':
        icon = 'excel-o';
        break;
      case 'doc':
      case 'docx':
      case 'docm':
        icon = 'word-o';
        break;
      case 'pdf':
        icon = 'pdf-o';
        break;
      case 'ppt':
      case 'pptx':
        icon = 'powerpoint-o';
        break;
      case 'txt':
      case 'rtf':
      case 'md':
        icon = 'text-o';
        break;
      default:
        icon = 'o';
    }

    const iconClass = 'fa fa-file-' + icon;

    return <span><i className={iconClass} /> {filename}</span>;

  }

  renderSideBarWebContent() {

    const { model, editMode } = this.props;

    const extractFilename = (href: string) => {
      const index = href.lastIndexOf('/');
      if (index !== -1) {
        return href.substr(index + 1);
      }
      return href;
    };

    const label = model.href.startsWith('..')
      ? this.renderFileLabel(extractFilename(model.href))
      : 'No File Selected';

    return (
      <React.Fragment>

        <SidebarGroup label="Media File">

          <div>
            {label}
          </div>

          <ToolbarButton
            disabled={!editMode}
            onClick={this.onSelect.bind(this)} size={ToolbarButtonSize.Large}>
            <div><i className="far fa-file" /></div>
            <div>Select File</div>
          </ToolbarButton>
        </SidebarGroup>

      </React.Fragment>
    );
  }

  onSourceChange(isExternal) {
    this.setState({ isExternal });
  }

  renderSidebar() {

    const { editMode } = this.props;

    const content = this.state.isExternal
      ? this.renderSideBarExternal()
      : this.renderSideBarWebContent();

    return (
      <SidebarContent title="Hyperlink">

        <SidebarGroup label="Source">
          <div className="form-check">
            <label className="form-check-label">
              <input className="form-check-input"
                name="sizingOptions"
                value="webcontent"
                disabled={!editMode}
                checked={!this.state.isExternal}
                onChange={() => this.onSourceChange(false)}
                type="radio" />&nbsp;
      Media Library
            </label>
          </div>
          <div className="form-check" style={{ marginBottom: '30px' }}>
            <label className="form-check-label">
              <input className="form-check-input"
                name="sizingOptions"
                onChange={() => this.onSourceChange(true)}
                value="external"
                disabled={!editMode}
                checked={this.state.isExternal}
                type="radio" />&nbsp;
      URL
            </label>
          </div>
        </SidebarGroup>

        {content}

      </SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup
        label="Hyperlink"
        highlightColor={CONTENT_COLORS.Xref}
        columns={3}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.props.onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }
}
