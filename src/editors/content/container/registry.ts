
import { CodeBlock } from '../learning/CodeBlock';
import { Example } from '../learning/Example';
import { Pullout } from '../learning/Pullout';
import { Section } from '../learning/Section';
import { WbInline } from '../learning/WbInline';
import { Activity } from '../learning/Activity';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import Unsupported from '../learning/Unsupported';

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
  registry['Example'] = Example;
  registry['Pullout'] = Pullout;
  registry['Section'] = Section;
  registry['WbInline'] = WbInline;
  registry['Activity'] = Activity;
}
