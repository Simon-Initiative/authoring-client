import { connectSidebarActions } from './connectSidebarActions';
import CodeBlockEditor from '../learning/CodeBlockEditor';
import ExampleEditor from '../learning/ExampleEditor';
import PulloutEditor from '../learning/PulloutEditor';
import SectionEditor from '../learning/SectionEditor';
import WbInlineEditor from '../learning/WbInlineEditor';
import ActivityEditor from '../learning/ActivityEditor';
import BlockCodeEditor from '../learning/blockcode/BlockCodeEditor';
import BlockFormulaEditor from '../learning/blockformula/BlockFormulaEditor';
import ContiguousTextEditor from '../learning/contiguoustext/ContiguousTextEditor';
import UnsupportedEditor from '../learning/UnsupportedEditor';
import LinkEditor from '../learning/LinkEditor';
import ActivityLinkEditor from '../learning/ActivityLinkEditor';
import BlockQuoteEditor from '../learning/blockquote/BlockQuoteEditor';
import MathEditor from '../learning/MathEditor';
import CiteEditor from '../learning/CiteEditor';
import XrefEditor from '../learning/XrefEditor';
import ImageEditor from '../learning/ImageEditor';
import AudioEditor from '../learning/AudioEditor';
import VideoEditor from '../learning/VideoEditor';
import IFrameEditor from '../learning/IFrameEditor';
import YouTubeEditor from '../learning/YouTubeEditor';
import OrderedListEditor from '../learning/OrderedListEditor';
import UnorderedListEditor from '../learning/UnorderedListEditor';
import ListItemEditor from '../learning/ListItemEditor';
import TableEditor from '../learning/table/TableEditor';
import CellEditor from '../learning/table/CellEditor';
import DefinitionEditor from '../learning/DefinitionEditor';
import MeaningEditor from '../learning/MeaningEditor';
import TranslationEditor from '../learning/TranslationEditor';
import PronunciationEditor from '../learning/PronunciationEditor';
import HintEditor from '../part/HintEditor';
import QuoteEditor from '../learning/QuoteEditor';
import MaterialsEditor from '../learning/MaterialsEditor';
import MaterialEditor from '../learning/MaterialEditor';
import AlternativesEditor from '../learning/AlternativesEditor';
import AlternativeEditor from '../learning/AlternativeEditor';


let registry = null;

export function getEditorByContentType(contentType: string) {

  if (registry === null) {
    init();
  }

  const component = registry[contentType];
  return component !== undefined ? component : UnsupportedEditor;
}

function init() {
  registry = {};
  registry['Hint'] = HintEditor;
  registry['ContiguousText'] = connectSidebarActions()(ContiguousTextEditor);
  registry['CodeBlock'] = connectSidebarActions()(CodeBlockEditor);
  registry['Link'] = connectSidebarActions()(LinkEditor);
  registry['Image'] = connectSidebarActions()(ImageEditor);
  registry['ActivityLink'] = connectSidebarActions()(ActivityLinkEditor);
  registry['BlockQuote'] = connectSidebarActions()(BlockQuoteEditor);
  registry['Quote'] = connectSidebarActions()(QuoteEditor);
  registry['Math'] = connectSidebarActions()(MathEditor);
  registry['Cite'] = connectSidebarActions()(CiteEditor);
  registry['Xref'] = connectSidebarActions()(XrefEditor);
  registry['Example'] = connectSidebarActions()(ExampleEditor);
  registry['Pullout'] = connectSidebarActions()(PulloutEditor);
  registry['Section'] = connectSidebarActions()(SectionEditor);
  registry['WbInline'] = connectSidebarActions()(WbInlineEditor);
  registry['Activity'] = connectSidebarActions()(ActivityEditor);
  registry['YouTube'] = connectSidebarActions()(YouTubeEditor);
  registry['BlockCode'] = connectSidebarActions()(BlockCodeEditor);
  registry['BlockFormula'] = connectSidebarActions()(BlockFormulaEditor);
  registry['Audio'] = connectSidebarActions()(AudioEditor);
  registry['Video'] = connectSidebarActions()(VideoEditor);
  registry['IFrame'] = connectSidebarActions()(IFrameEditor);
  registry['Ol'] = connectSidebarActions()(OrderedListEditor);
  registry['Ul'] = connectSidebarActions()(UnorderedListEditor);
  registry['Li'] = connectSidebarActions()(ListItemEditor);
  registry['Table'] = connectSidebarActions()(TableEditor);
  registry['CellData'] = connectSidebarActions()(CellEditor);
  registry['CellHeader'] = connectSidebarActions()(CellEditor);
  registry['Definition'] = connectSidebarActions()(DefinitionEditor);
  registry['Meaning'] = connectSidebarActions()(MeaningEditor);
  registry['Translation'] = connectSidebarActions()(TranslationEditor);
  registry['Pronunciation'] = connectSidebarActions()(PronunciationEditor);
  registry['Materials'] = connectSidebarActions()(MaterialsEditor);
  registry['Material'] = connectSidebarActions()(MaterialEditor);
  registry['Alternatives'] = connectSidebarActions()(AlternativesEditor);
  registry['Alternative'] = connectSidebarActions()(AlternativeEditor);
}
