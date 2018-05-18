import * as React from 'react';
import { ComponentProps } from 'types/component';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { Resource } from 'data/content/resource';
import DeleteResourceModal from 'components/DeleteResourceModal';
import { Edge } from 'types/edge';
import { Maybe } from 'tsmonad/lib/src';
import { OrderedMap } from 'immutable';

export interface ActionsToolbarProps {
  courseId: string;
  documentResource: Resource;
  documentId: string;
  canUndo: boolean;
  canRedo: boolean;
  canPreview: boolean;
  onShowPageDetails: () => void;
  onPreview: (courseId: string, resource: Resource) => Promise<any>;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  fetchResourceEdges: (resource: Resource) => Promise<Maybe<OrderedMap<string, Edge>>>;
}

/**
 * ActionsToolbar React Stateless Component
 */
export const ActionsToolbar = (({
  courseId, documentResource, documentId, canUndo, canRedo,
  canPreview, onShowPageDetails, onPreview, onUndo, onRedo,
  fetchResourceEdges, onDismissModal, onDisplayModal,
}: ComponentProps<ActionsToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayout.Column>
        <ToolbarButton
          onClick={() => onUndo(documentId)}
          disabled={!canUndo}
          size={ToolbarButtonSize.Wide}>
          <i className={'fa fa-undo'} /> Undo
        </ToolbarButton>
        <ToolbarButton
          onClick={() => onRedo(documentId)}
          disabled={!canRedo}
          size={ToolbarButtonSize.Wide}>
          <i className={'fa fa-repeat'} /> Redo
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
          onClick={() => fetchResourceEdges(documentResource)
            .then(edges => onDisplayModal(
              <DeleteResourceModal
                resource={documentResource}
                edges={edges}
                onDelete={() => { }}
                onCancel={onDismissModal} />))}
          size={ToolbarButtonSize.Large}
          tooltip="Delete this Page"
          disabled={false}>
          <div><i className="fa fa-trash-o" /></div>
          <div>Delete</div>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => onPreview(courseId, documentResource)}
          tooltip="Preview this Page"
          disabled={!canPreview}
          size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-eye" /></div>
          <div>Preview</div>
        </ToolbarButton>
      </ToolbarLayout.Inline>
    </React.Fragment>
  );
});
