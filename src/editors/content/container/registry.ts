import ActivityEditor from 'editors/content/learning/ActivityEditor';
import ActivityLinkEditor from 'editors/content/learning/ActivityLinkEditor';
import AlternativeEditor from 'editors/content/learning/AlternativeEditor';
import AlternativesEditor from 'editors/content/learning/AlternativesEditor';
import AppletEditor from 'editors/content/learning/AppletEditor';
import AudioEditor from 'editors/content/learning/AudioEditor';
import BlockCodeEditor from 'editors/content/learning/blockcode/BlockCodeEditor';
import BlockFormulaEditor from 'editors/content/learning/blockformula/BlockFormulaEditor';
import BlockQuoteEditor from 'editors/content/learning/blockquote/BlockQuoteEditor';
import CellEditor from 'editors/content/learning/table/CellEditor';
import CiteEditor from 'editors/content/learning/CiteEditor';
import CodeBlockEditor from 'editors/content/learning/CodeBlockEditor';
import CompositeEditor from 'editors/content/learning/CompositeEditor';
import ConjugateEditor from 'editors/content/learning/conjugation/ConjugateEditor';
import ConjugationEditor from 'editors/content/learning/conjugation/ConjugationEditor';
import DefinitionEditor from 'editors/content/learning/DefinitionEditor';
import DialogEditor from 'editors/content/learning/dialog/DialogEditor';
import DirectorEditor from 'editors/content/learning/DirectorEditor';
import ExampleEditor from 'editors/content/learning/ExampleEditor';
import ExtraDefinitionEditor from 'editors/content/learning/ExtraDefinitionEditor';
import FigureEditor from 'editors/content/learning/FigureEditor';
import FlashEditor from 'editors/content/learning/FlashEditor';
import HintEditor from 'editors/content/part/HintEditor';
import IFrameEditor from 'editors/content/learning/IFrameEditor';
import ImageEditor from 'editors/content/learning/ImageEditor';
import InstructionsEditor from 'editors/content/learning/InstructionsEditor';
import LineEditor from 'editors/content/learning/dialog/LineEditor';
import LinkEditor from 'editors/content/learning/LinkEditor';
import ListItemEditor from 'editors/content/learning/ListItemEditor';
import MaterialEditor from 'editors/content/learning/MaterialEditor';
import MaterialsEditor from 'editors/content/learning/MaterialsEditor';
import MathEditor from 'editors/content/learning/MathEditor';
import MathematicaEditor from 'editors/content/learning/MathematicaEditor';
import MeaningEditor from 'editors/content/learning/MeaningEditor';
import OrderedListEditor from 'editors/content/learning/OrderedListEditor';
import PanoptoEditor from 'editors/content/learning/PanoptoEditor';
import ParamEditor from 'editors/content/learning/ParamEditor';
import PronunciationEditor from 'editors/content/learning/PronunciationEditor';
import PulloutEditor from 'editors/content/learning/PulloutEditor';
import QuoteEditor from 'editors/content/learning/QuoteEditor';
import SectionEditor from 'editors/content/learning/SectionEditor';
import SpeakerEditor from 'editors/content/learning/dialog/SpeakerEditor';
import SymEditor from 'editors/content/learning/SymEditor';
import TableEditor from 'editors/content/learning/table/TableEditor';
import TranslationEditor from 'editors/content/learning/TranslationEditor';
import UnityEditor from 'editors/content/learning/UnityEditor';
import UnorderedListEditor from 'editors/content/learning/UnorderedListEditor';
import UnsupportedEditor from 'editors/content/learning/UnsupportedEditor';
import VideoEditor from 'editors/content/learning/VideoEditor';
import WbInlineEditor from 'editors/content/learning/WbInlineEditor';
import XrefEditor from 'editors/content/learning/XrefEditor';
import YouTubeEditor from 'editors/content/learning/YouTubeEditor';
import {
  ContiguousTextEditor,
} from 'editors/content/learning/contiguoustext/ContiguousTextEditor.controller';
import { CustomEditor } from 'editors/content/learning/CustomEditor';
import { connectEditor, connectPopupEditor } from 'editors/content/container/connectEditor';

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
  registry['Activity'] = connectEditor(ActivityEditor);
  registry['ActivityLink'] = connectEditor(ActivityLinkEditor);
  registry['Alternative'] = connectEditor(AlternativeEditor);
  registry['Alternatives'] = connectEditor(AlternativesEditor);
  registry['Applet'] = connectEditor(AppletEditor);
  registry['Audio'] = connectEditor(AudioEditor);
  registry['BlockCode'] = connectEditor(BlockCodeEditor);
  registry['BlockFormula'] = connectEditor(BlockFormulaEditor);
  registry['BlockQuote'] = connectEditor(BlockQuoteEditor);
  registry['CellData'] = connectEditor(CellEditor);
  registry['CellHeader'] = connectEditor(CellEditor);
  registry['Cite'] = connectEditor(CiteEditor);
  registry['CodeBlock'] = connectEditor(CodeBlockEditor);
  registry['Composite'] = connectEditor(CompositeEditor);
  registry['Conjugate'] = connectEditor(ConjugateEditor);
  registry['Conjugation'] = connectEditor(ConjugationEditor);
  registry['ContiguousText'] = connectEditor(ContiguousTextEditor);
  registry['Custom'] = connectEditor(CustomEditor);
  registry['Definition'] = connectEditor(DefinitionEditor);
  registry['Dialog'] = connectEditor(DialogEditor);
  registry['Director'] = connectEditor(DirectorEditor);
  registry['Example'] = connectEditor(ExampleEditor);
  registry['Extra'] = connectPopupEditor(ExtraDefinitionEditor);
  registry['Figure'] = connectEditor(FigureEditor);
  registry['Flash'] = connectEditor(FlashEditor);
  registry['Hint'] = HintEditor;
  registry['IFrame'] = connectEditor(IFrameEditor);
  registry['Image'] = connectEditor(ImageEditor);
  registry['Instructions'] = connectEditor(InstructionsEditor);
  registry['Li'] = connectEditor(ListItemEditor);
  registry['Line'] = connectEditor(LineEditor);
  registry['Link'] = connectEditor(LinkEditor);
  registry['Material'] = connectEditor(MaterialEditor);
  registry['Materials'] = connectEditor(MaterialsEditor);
  registry['Math'] = connectEditor(MathEditor);
  registry['Mathematica'] = connectEditor(MathematicaEditor);
  registry['Meaning'] = connectEditor(MeaningEditor);
  registry['Ol'] = connectEditor(OrderedListEditor);
  registry['Panopto'] = connectEditor(PanoptoEditor);
  registry['Param'] = connectEditor(ParamEditor);
  registry['Pronunciation'] = connectEditor(PronunciationEditor);
  registry['Pullout'] = connectEditor(PulloutEditor);
  registry['Quote'] = connectEditor(QuoteEditor);
  registry['Section'] = connectEditor(SectionEditor);
  registry['Speaker'] = connectEditor(SpeakerEditor);
  registry['Sym'] = connectEditor(SymEditor);
  registry['Table'] = connectEditor(TableEditor);
  registry['Translation'] = connectEditor(TranslationEditor);
  registry['Ul'] = connectEditor(UnorderedListEditor);
  registry['Unity'] = connectEditor(UnityEditor);
  registry['Video'] = connectEditor(VideoEditor);
  registry['WbInline'] = connectEditor(WbInlineEditor);
  registry['Xref'] = connectEditor(XrefEditor);
  registry['YouTube'] = connectEditor(YouTubeEditor);
}
