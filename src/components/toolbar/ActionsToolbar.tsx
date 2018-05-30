import * as React from 'react';
import { ComponentProps } from 'types/component';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { Resource } from 'data/content/resource';
import { DeleteResourceModal } from 'components/DeleteResourceModal.controller';
import { CourseModel } from 'data/models';

export interface ActionsToolbarProps {
  course: CourseModel;
  documentResource: Resource;
  documentId: string;
  canUndo: boolean;
  canRedo: boolean;
  canPreview: boolean;
  onShowPageDetails: () => void;
  onQuickPreview: (courseId: string, resource: Resource) => void;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
}

/**
 * ActionsToolbar React Stateless Component
 */
export const ActionsToolbar = (({
  course, documentResource, documentId, canUndo, canRedo,
  canPreview, onShowPageDetails, onQuickPreview, onUndo, onRedo,
  onDismissModal, onDisplayModal,
}: ComponentProps<ActionsToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayout.Column>
        <ToolbarButton
            onClick={() => onUndo(documentId)}
            disabled={!canUndo}
            size={ToolbarButtonSize.Full}>
          <i className={'fa fa-undo'}/> Undo
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onRedo(documentId)}
            disabled={!canRedo}
            size={ToolbarButtonSize.Full}>
          <i className={'fa fa-repeat'}/> Redo
        </ToolbarButton>
      </ToolbarLayout.Column>
      <ToolbarLayout.Inline>
        <ToolbarButton
          onClick={() => onShowPageDetails()}
          tooltip="View and Edit Page Details"
          size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-info-circle" /></div>
          <div>Details</div>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => onDisplayModal(
            <DeleteResourceModal
              resource={documentResource}
              course={course}
              onDismissModal={onDismissModal} />)}
          size={ToolbarButtonSize.Large}
          tooltip="Delete this Page">
          <div><i className="fa fa-trash-o" /></div>
        <div>Delete</div>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onQuickPreview(course.guid, documentResource)}
        tooltip="Preview this Page"
        disabled={!canPreview}
        size={ToolbarButtonSize.Large}>
        <div><i className="fa fa-eye" /></div>
        <div>Preview</div>
      </ToolbarButton>
      </ToolbarLayout.Inline>
    </React.Fragment >
  );
});
