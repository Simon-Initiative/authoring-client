import { AppContext } from '../../../../common/AppContext';
import { AppServices } from '../../../../common/AppServices';

export type BlockProps = {

  // Callback to indicate the block renderer has set
  // full edit mode 
  onEditModeChange: (editMode: boolean) => void;

  // Callback to indicate the block renderer has set
  // lock mode 
  onLockChange: (locked: boolean) => void;

  onEdit: (data: any) => void;

  services: AppServices;

  context: AppContext;

};