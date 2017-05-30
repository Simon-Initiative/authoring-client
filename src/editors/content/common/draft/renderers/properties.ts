import { ContentState } from 'draft-js';
import { AppContext } from '../../../../common/AppContext';
import { AppServices } from '../../../../common/AppServices';

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

  services: AppServices;

  editMode: boolean;

  context: AppContext;

};
