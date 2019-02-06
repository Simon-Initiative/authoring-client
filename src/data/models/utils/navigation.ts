import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';

import { HasGuid, Nodes } from 'data/utils/tree';


// Combine arbitrary number of ordered maps into one
function combine(...maps: Immutable.OrderedMap<string, any>[])
  : Immutable.OrderedMap<string, any> {
  return maps.reduce(
    (acc, current) => {
      return acc.merge(current);
    },
    Immutable.OrderedMap(),
  );
}


// Defines how we navigate through workbook page content elements
export function getChildren<NodeType extends HasGuid>(
  node: HasGuid): Maybe<Nodes<NodeType>> {
  switch ((node as any).contentType) {

    case 'Page':
      return Maybe.just((node as contentTypes.Page).nodes as any);
    case 'Question':
      const question = node as contentTypes.Question;
      const questionAll = combine(
        question.items,
        question.parts,
        question.explanation.content,
      );
      return Maybe.just(questionAll);
    case 'Part':
      const part = node as contentTypes.Part;
      const partAll = combine(
        part.criteria,
        part.hints,
        part.responses,
        part.responseMult,
      );
      return Maybe.just(partAll);
    case 'Response':
      return Maybe.just((node as contentTypes.Response).feedback as any);
    case 'MultipleChoice':
      return Maybe.just((node as contentTypes.MultipleChoice).choices as any);
    case 'Ordering':
      return Maybe.just((node as contentTypes.Ordering).choices as any);
    case 'ShortAnswer':
      return Maybe.nothing();
    case 'Essay':
      return Maybe.nothing();
    case 'GradingCriteria':
      return Maybe.just((node as contentTypes.GradingCriteria).body.content as any);
    case 'Choice':
      return Maybe.just((node as contentTypes.Choice).body.content as any);
    case 'Content':
      return Maybe.just((node as contentTypes.Content).body.content as any);
    case 'Custom':
      return Maybe.nothing();
    case 'Feedback':
      return Maybe.just((node as contentTypes.Feedback).body.content as any);
    case 'FillInTheBlank':
      return Maybe.just((node as contentTypes.FillInTheBlank).choices as any);
    case 'Hint':
      return Maybe.just((node as contentTypes.Hint).body.content as any);
    case 'Hotspot':
      return Maybe.nothing();
    case 'ImageHotspot':
      return Maybe.just((node as contentTypes.ImageHotspot).hotspots as any);
    case 'Match':
      return Maybe.nothing();
    case 'Numeric':
      return Maybe.nothing();
    case 'Pool':
      return Maybe.just((node as contentTypes.Pool).questions as any);
    case 'ResponseMult':
      return Maybe.nothing();
    case 'Selection':
      const selection = node as contentTypes.Selection;
      const source = selection.source;
      return Maybe.just(Immutable.OrderedMap<string, contentTypes.SelectionSource>(
        [source.guid, source]) as any);
    case 'Text':
      return Maybe.nothing();
    case 'Variable':
      return Maybe.nothing();
    case 'Section':
      return Maybe.just((node as contentTypes.WorkbookSection).body.content as any);
    case 'Material':
      return Maybe.just((node as contentTypes.Material).content.content as any);
    case 'Alternatives':
      return Maybe.just((node as contentTypes.Alternatives).content as any);
    case 'Alternative':
      return Maybe.just((node as contentTypes.Alternative).content.content as any);
    case 'Meaning':
      return Maybe.just((node as contentTypes.Meaning).material.content.content as any);
    case 'Definition':
      const definition = node as contentTypes.Definition;
      const all = combine(
        definition.meaning,
        definition.translation,
        definition.pronunciation.caseOf({
          just: p => p.content.content,
          nothing: () => Immutable.OrderedMap<string, any>(),
        }),
      );
      return Maybe.just(all);
    case 'Materials':
      return Maybe.just((node as contentTypes.Materials).content as any);
    case 'Composite':
      return Maybe.just((node as contentTypes.Composite).content.content as any);
    case 'Example':
      return Maybe.just((node as contentTypes.Example).content.content as any);
    case 'Figure':
      return Maybe.just((node as contentTypes.Figure).content.content as any);
    case 'Pullout':
      return Maybe.just((node as contentTypes.Pullout).content.content as any);
    case 'Ul':
      return Maybe.just((node as contentTypes.Ul).listItems as any);
    case 'Translation':
      return Maybe.just((node as contentTypes.Translation).content.content as any);
    case 'Table':
      return Maybe.just((node as contentTypes.Table).rows as any);
    case 'Row':
      return Maybe.just((node as contentTypes.Row).cells as any);
    case 'CellData':
      return Maybe.just((node as contentTypes.CellData).content.content as any);
    case 'CellHeader':
      return Maybe.just((node as contentTypes.CellHeader).content.content as any);
    case 'Pronunciation':
      return Maybe.just((node as contentTypes.Pronunciation).content.content as any);
    case 'Ol':
      return Maybe.just((node as contentTypes.Ol).listItems as any);
    case 'Li':
      return Maybe.just((node as contentTypes.Li).content.content as any);
    case 'Unity':
    case 'Panopto':
    case 'IFrame':
    case 'Video':
    case 'Audio':
    case 'Director':
    case 'Applet':
    case 'Flash':
    case 'Mathematica':
      return Maybe.just((node as any).caption.content as any);
    case 'Dialog':
      return Maybe.just((node as contentTypes.Dialog).lines as any);
    case 'Line':
      return Maybe.just((node as contentTypes.Line).material.content.content as any);
    case 'Dd':
      return Maybe.just((node as contentTypes.Dd).content.content as any);
    case 'Cr':
      return Maybe.just((node as contentTypes.Cr).cells as any);
    case 'ConjugationCell':
      return Maybe.just((node as contentTypes.ConjugationCell).content.content as any);
    case 'Conjugate':
      return Maybe.just((node as contentTypes.Conjugate).content.content as any);
    case 'Instructions':
      return Maybe.just((node as contentTypes.Instructions).content.content as any);
    default:
      return Maybe.nothing();
  }
}
