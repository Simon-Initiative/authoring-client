
import { CodeBlock } from '../learning/CodeBlock';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
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

  console.log(contentType);


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

}
