
import { CodeBlock } from '../learning/CodeBlock';
import { Example } from '../learning/Example';
import { Pullout } from '../learning/Pullout';
import { Section } from '../learning/Section';
import { WbInline } from '../learning/WbInline';
import { Activity } from '../learning/Activity';
import { YouTube } from '../learning/YouTube';
import ContiguousTextEditor from '../learning/ContiguousTextEditor';
import Unsupported from '../learning/Unsupported';
import { connectSidebarActions } from './connectSidebarActions';
import { LinkEditor } from '../learning/LinkEditor';
import { ActivityLinkEditor } from '../learning/ActivityLinkEditor';
import { QuoteEditor } from '../learning/QuoteEditor';
import { MathEditor } from '../learning/MathEditor';
import { CiteEditor } from '../learning/CiteEditor';
import { XrefEditor } from '../learning/XrefEditor';
import { ImageEditor } from '../media/ImageEditor';
import { AudioEditor } from '../media/AudioEditor';
import { VideoEditor } from '../media/VideoEditor';
import { IFrameEditor } from '../media/IFrameEditor';
import OrderedList from '../learning/OrderedList';
import UnorderedList from '../learning/UnorderedList';
import ListItem from '../learning/ListItem';

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
  registry['Quote'] = QuoteEditor;
  registry['Math'] = MathEditor;
  registry['Cite'] = CiteEditor;
  registry['Xref'] = XrefEditor;
  registry['Example'] = connectSidebarActions()(Example);
  registry['Pullout'] = connectSidebarActions()(Pullout);
  registry['Section'] = connectSidebarActions()(Section);
  registry['WbInline'] = connectSidebarActions()(WbInline);
  registry['Activity'] = connectSidebarActions()(Activity);
  registry['YouTube'] = connectSidebarActions()(YouTube);
  registry['Audio'] = connectSidebarActions()(AudioEditor);
  registry['Video'] = connectSidebarActions()(VideoEditor);
  registry['IFrame'] = connectSidebarActions()(IFrameEditor);
  registry['Ol'] = connectSidebarActions()(OrderedList);
  registry['Ul'] = connectSidebarActions()(UnorderedList);
  registry['Li'] = connectSidebarActions()(ListItem);
}
