
import { CodeBlock } from '../learning/CodeBlock';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import Unsupported from '../learning/Unsupported';
import { LinkEditor } from '../learning/LinkEditor';
import { ActivityLinkEditor } from '../learning/ActivityLinkEditor';


let registry = null;

export function getEditorByContentType(contentType: string) {

  if (registry === null) {
    init();
  }

  const component = registry[contentType];

  return component !== undefined ? component : Unsupported;
}

function init() {
  registry = {};
  registry['ContiguousText'] = ContiguousTextEditor;
  registry['CodeBlock'] = CodeBlock;
  registry['Link'] = LinkEditor;
  registry['ActivityLink'] = ActivityLinkEditor;

}
