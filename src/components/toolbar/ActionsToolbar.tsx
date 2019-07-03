import * as React from 'react';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models';
import { LegacyTypes } from 'data/types';

const getReadableResourceType = (documentResource: Resource) => {
  switch (documentResource && documentResource.type) {
    case LegacyTypes.workbook_page:
      return 'Page';
    case LegacyTypes.inline:
    case LegacyTypes.assessment2:
      return 'Assessment';
    case LegacyTypes.assessment2_pool:
      return 'Pool';
    default:
      return 'Resource';
  }
};

export interface ActionsToolbarProps {
  course: CourseModel;
  editMode: boolean;
  documentResource: Resource;
  documentId: string;
  canUndo: boolean;
  canRedo: boolean;
  canPreview: boolean;
  onShowPageDetails: () => void;
  onQuickPreview: (courseId: string, resource: Resource) => Promise<any>;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
}

export interface ActionsToolbarState {
  previewing: boolean;
}

/**
 * ActionsToolbar React Stateless Component
 */
export class ActionsToolbar extends React.PureComponent<ActionsToolbarProps, ActionsToolbarState> {

  constructor(props) {
    super(props);

    this.state = {
      previewing: false,
    };

    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.preview = this.preview.bind(this);
  }

  undo() {
    this.props.onUndo(this.props.documentId);
  }

  redo() {
    this.props.onRedo(this.props.documentId);
  }

  preview() {
    this.setState(
      { previewing: true },
      () => this.props.onQuickPreview(this.props.course.guid.value(), this.props.documentResource)
        .then(_ => this.setState({ previewing: false }))
        .catch(_ => this.setState({ previewing: false })));
  }

  render() {
    const { documentResource, editMode, canUndo, canRedo, canPreview } = this.props;

    const { previewing } = this.state;

    const ReadableResourceType = getReadableResourceType(documentResource);

    return (
      <React.Fragment>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={this.undo}
            disabled={!editMode || !canUndo}
            size={ToolbarButtonSize.Full}>
            <i className={'fa fa-undo'} /> Undo
        </ToolbarButton>
          <ToolbarButton
            onClick={this.redo}
            disabled={!editMode || !canRedo}
            size={ToolbarButtonSize.Full}>
            <i className={'fas fa-redo'} /> Redo
        </ToolbarButton>
        </ToolbarLayout.Column>
        <ToolbarLayout.Inline>
          <ToolbarButton
            onClick={this.props.onShowPageDetails}
            tooltip={`View and Edit ${ReadableResourceType} Details`}
            size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-info-circle" /></div>
            <div>Info</div>
          </ToolbarButton>
          <ToolbarButton
            onClick={this.preview}
            tooltip={`Preview this ${ReadableResourceType}`}
            disabled={previewing || !canPreview}
            size={ToolbarButtonSize.Large}>
            <div>{previewing
              ? <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />
              : <i className="fa fa-eye" />}</div>
            <div>{previewing
              ? 'Previewing'
              : 'Preview'}</div>
          </ToolbarButton>
        </ToolbarLayout.Inline>
      </React.Fragment>
    );
  }
}
