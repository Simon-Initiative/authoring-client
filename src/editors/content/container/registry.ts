
import { CodeBlock } from '../learning/CodeBlock';
import { Example } from '../learning/Example';
import { Pullout } from '../learning/Pullout';
import { Section } from '../learning/Section';
import ContiguousTextEditor from '../learning/ContiguousTextEditor.controller';
import Unsupported from '../learning/Unsupported';
import { LinkEditor } from '../learning/LinkEditor';
import { ActivityLinkEditor } from '../learning/ActivityLinkEditor';
import { QuoteEditor } from '../learning/QuoteEditor';
import { MathEditor } from '../learning/MathEditor';
import { CiteEditor } from '../learning/CiteEditor';
import { XrefEditor } from '../learning/XrefEditor';


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
  registry['Quote'] = QuoteEditor;
  registry['Math'] = MathEditor;
  registry['Cite'] = CiteEditor;
  registry['Xref'] = XrefEditor;
  registry['Example'] = Example;
  registry['Pullout'] = Pullout;
  registry['Section'] = Section;
}
