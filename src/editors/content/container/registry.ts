
import { CodeBlock } from '../learning/CodeBlock';
import { Example } from '../learning/Example';
import { Pullout } from '../learning/Pullout';
import { Section } from '../learning/Section';
import { WbInline } from '../learning/WbInline';
import { Activity } from '../learning/Activity';
import { BlockCode } from '../learning/blockcode/BlockCode';
import { BlockFormula } from '../learning/blockformula/BlockFormula';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import Unsupported from '../learning/Unsupported';
import { connectSidebarActions } from './connectSidebarActions';
import { LinkEditor } from '../learning/LinkEditor';
import { ActivityLinkEditor } from '../learning/ActivityLinkEditor';
import { BlockQuote } from '../learning/blockquote/BlockQuote';
import { MathEditor } from '../learning/MathEditor';
import { CiteEditor } from '../learning/CiteEditor';
import { XrefEditor } from '../learning/XrefEditor';
import { ImageEditor } from '../media/ImageEditor';
import { AudioEditor } from '../media/AudioEditor';
import { VideoEditor } from '../media/VideoEditor';
import { IFrameEditor } from '../media/IFrameEditor';
import { YouTubeEditor } from '../media/YouTubeEditor';
import OrderedList from '../learning/OrderedList';
import UnorderedList from '../learning/UnorderedList';
import ListItem from '../learning/ListItem';
import { TableEditor } from '../learning/table/TableEditor';
import { CellEditor } from '../learning/table/CellEditor';
import DefinitionEditor from '../learning/DefinitionEditor';
import MeaningEditor from '../learning/MeaningEditor';
import TranslationEditor from '../learning/TranslationEditor';
import PronunciationEditor from '../learning/PronunciationEditor';

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
  registry['Link'] = LinkEditor;
  registry['Image'] = connectSidebarActions()(ImageEditor);
  registry['ActivityLink'] = ActivityLinkEditor;
  registry['BlockQuote'] = connectSidebarActions()(BlockQuote);
  registry['Math'] = MathEditor;
  registry['Cite'] = CiteEditor;
  registry['Xref'] = XrefEditor;
  registry['Example'] = connectSidebarActions()(Example);
  registry['Pullout'] = connectSidebarActions()(Pullout);
  registry['Section'] = connectSidebarActions()(Section);
  registry['WbInline'] = connectSidebarActions()(WbInline);
  registry['Activity'] = connectSidebarActions()(Activity);
  registry['YouTube'] = connectSidebarActions()(YouTubeEditor);
  registry['BlockCode'] = connectSidebarActions()(BlockCode);
  registry['BlockFormula'] = connectSidebarActions()(BlockFormula);
  registry['Audio'] = connectSidebarActions()(AudioEditor);
  registry['Video'] = connectSidebarActions()(VideoEditor);
  registry['IFrame'] = connectSidebarActions()(IFrameEditor);
  registry['Ol'] = connectSidebarActions()(OrderedList);
  registry['Ul'] = connectSidebarActions()(UnorderedList);
  registry['Li'] = connectSidebarActions()(ListItem);
  registry['Table'] = connectSidebarActions()(TableEditor);
  registry['CellData'] = connectSidebarActions()(CellEditor);
  registry['CellHeader'] = connectSidebarActions()(CellEditor);
  registry['Definition'] = connectSidebarActions()(DefinitionEditor);
  registry['Meaning'] = connectSidebarActions()(MeaningEditor);
  registry['Translation'] = connectSidebarActions()(TranslationEditor);
  registry['Pronunciation'] = connectSidebarActions()(PronunciationEditor);
}
