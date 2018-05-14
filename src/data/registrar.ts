
import * as ct from './contentTypes';
import { registerType } from './content/common/parse';

export function registerContentTypes() {
  registerType('activity_link', ct.ActivityLink.fromPersistence);
  registerType('alternate', ct.Alternate.fromPersistence);
  registerType('alternative', ct.Alternative.fromPersistence);
  registerType('alternatives', ct.Alternatives.fromPersistence);
  registerType('audio', ct.Audio.fromPersistence);
  registerType('caption', ct.Caption.fromPersistence);
  registerType('composite_activity', ct.Composite.fromPersistence);
  registerType('custom', ct.Custom.fromPersistence);
  registerType('extra', ct.Extra.fromPersistence);
  registerType('anchor', ct.Anchor.fromPersistence);
  registerType('applet', ct.Applet.fromPersistence);
  registerType('director', ct.Director.fromPersistence);
  registerType('mathematica', ct.Mathematica.fromPersistence);
  registerType('flash', ct.Flash.fromPersistence);
  registerType('panopto', ct.Panopto.fromPersistence);
  registerType('unity', ct.Unity.fromPersistence);
  registerType('td', ct.CellData.fromPersistence);
  registerType('th', ct.CellHeader.fromPersistence);
  registerType('cite', ct.Cite.fromPersistence);
  registerType('code', ct.BlockCode.fromPersistence);
  registerType('codeblock', ct.CodeBlock.fromPersistence);
  registerType('dd', ct.Dd.fromPersistence);
  registerType('default', ct.Default.fromPersistence);
  registerType('definition', ct.Definition.fromPersistence);
  registerType('dialog', ct.Dialog.fromPersistence);
  registerType('line', ct.Line.fromPersistence);
  registerType('speaker', ct.Speaker.fromPersistence);
  registerType('dl', ct.Dl.fromPersistence);
  registerType('dt', ct.Dt.fromPersistence);
  registerType('example', ct.Example.fromPersistence);
  registerType('figure', ct.Figure.fromPersistence);
  registerType('formula', ct.BlockFormula.fromPersistence);
  registerType('iframe', ct.IFrame.fromPersistence);
  registerType('instructions', ct.Instructions.fromPersistence);
  registerType('image', ct.Image.fromPersistence);
  registerType('li', ct.Li.fromPersistence);
  registerType('link', ct.Link.fromPersistence);
  registerType('material', ct.Material.fromPersistence);
  registerType('materials', ct.Materials.fromPersistence);
  registerType('math', ct.Math.fromPersistence);
  registerType('meaning', ct.Meaning.fromPersistence);
  registerType('objref', ct.ObjRef.fromPersistence);
  registerType('ol', ct.Ol.fromPersistence);
  registerType('param', ct.Param.fromPersistence);
  registerType('popout', ct.Popout.fromPersistence);
  registerType('pref:label', ct.PrefLabel.fromPersistence);
  registerType('pref:value', ct.PrefValue.fromPersistence);
  registerType('pronunciation', ct.Pronunciation.fromPersistence);
  registerType('pullout', ct.Pullout.fromPersistence);
  registerType('quote', ct.BlockQuote.fromPersistence);
  registerType('tr', ct.Row.fromPersistence);
  registerType('sym', ct.Sym.fromPersistence);
  registerType('source', ct.Source.fromPersistence);
  registerType('table', ct.Table.fromPersistence);
  registerType('title', ct.Title.fromPersistence);
  registerType('track', ct.Track.fromPersistence);
  registerType('translation', ct.Translation.fromPersistence);
  registerType('ul', ct.Ul.fromPersistence);
  registerType('video', ct.Video.fromPersistence);
  registerType('youtube', ct.YouTube.fromPersistence);
  registerType('activity', ct.Activity.fromPersistence);
  registerType('section', ct.WorkbookSection.fromPersistence);
  registerType('wb:inline', ct.WbInline.fromPersistence);
  registerType('xref', ct.Xref.fromPersistence);
}
