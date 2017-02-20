
import WorkbookPageEditor from './workbook/WorkbookPageEditor';

import { register } from './registry';

export default function initEditorRegistry() {
  register({name: 'workbook', editor: WorkbookPageEditor});
}