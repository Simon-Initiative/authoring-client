import { MessageAction } from './message';

export const RELOAD_ACTION = {
  label: 'Reload Page',
  execute: () => location.reload(),
};
