import { ContentState } from 'draft-js';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';

export type BlockProps = {

  // Callback to allow a renderer to completely
  // change the content state of the draft editor
  onContentChange: (contentState: ContentState) => void;

  // Callback to indicate the block renderer has set
  // full edit mode
  onEditModeChange: (editMode: boolean) => void;

  // Callback to indicate the block renderer has set
  // lock mode
  onLockChange: (locked: boolean) => void;

  onEdit: (data: any) => void;

  // Callback to indicate that this block should be removed
  onRemove: () => void;

  // Callback to indicate that a new, empty block should be
  // inserted following the block specified by key
  onInsertBlock: (key: string) => void;

  services: AppServices;

  editMode: boolean;

  context: AppContext;

};
