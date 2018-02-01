import * as contentTypes from 'data/contentTypes';
import { AbstractContentEditor } from '../common/AbstractContentEditor';

import CodeBlock from '../learning/CodeBlock';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import Unsupported from '../learning/Unsupported';

export const registry = {};

export function getEditorByContentType(contentType: string) {
  const component = registry[name];

  return component !== undefined ? component : Unsupported;
}


export default function init() {
  registry['ContiguousText'] = ContiguousTextEditor;
  registry['CodeBlock'] = CodeBlock;
}
