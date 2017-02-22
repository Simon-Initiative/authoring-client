
import WorkbookPageEditor from './workbook/WorkbookPageEditor';
import CourseEditor from './course/CourseEditor';

import { register } from './registry';

export default function initEditorRegistry() {
  register({name: 'workbook', editor: WorkbookPageEditor});
  register({name: 'course', editor: CourseEditor});
  
}