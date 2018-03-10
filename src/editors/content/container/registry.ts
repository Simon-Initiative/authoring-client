
import { CodeBlock } from '../learning/CodeBlock';
import { Example } from '../learning/Example';
import { Pullout } from '../learning/Pullout';
import { Section } from '../learning/Section';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import Unsupported from '../learning/Unsupported';
import { connectSidebarActions } from './connectSidebarActions';

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
  registry['CodeBlock'] = connectSidebarActions()(CodeBlock);
  registry['Example'] = connectSidebarActions()(Example);
  registry['Pullout'] = connectSidebarActions()(Pullout);
  registry['Section'] = connectSidebarActions()(Section);
}
