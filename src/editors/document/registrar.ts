
import WorkbookPageEditor from './workbook/WorkbookPageEditor';
import CourseEditor from './course/CourseEditor';

import { ModelTypes } from '../../data/content';
import { register } from './registry';

export default function initEditorRegistry() {
  register({name: ModelTypes.WorkbookPageModel, editor: WorkbookPageEditor});
  register({name: ModelTypes.CourseModel, editor: CourseEditor});
}