
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ResolvedDependency } from './resolvers';
import { ContentElement } from 'data/content/common/interfaces';

// For a list of ContentElement instances (that may have content dependencies),
// take and apply a collection of resolved dependencies.  This involves traversing
// the immutable, hierarchical structure of the ContentElement instances, updating
// their state as we find content instances that have a resolved dependency.
export function applyResolutions(
  resolved: Immutable.List<ResolvedDependency>, elements: Immutable.List<ContentElement>)
  : Immutable.List<ContentElement> {

  const mappedDependencies = Immutable.Map<string, ResolvedDependency>(
    [resolved.toArray().map(d => [d.dependency.guid, d])]);

  return Immutable.List<ContentElement>(elements
    .toArray()
    .map(element => apply(element, mappedDependencies)));
}

function apply(
  element: ContentElement,
  mappedDependencies: Immutable.Map<string, ResolvedDependency>) : ContentElement {

  switch (element.contentType) {
    case 'Table':
      return (element as contentTypes.Table).with({
        rows: (element as contentTypes.Table).rows.map(
          row => apply(row, mappedDependencies) as contentTypes.Row).toOrderedMap(),
      });
    case 'Ol':
      const ol = (element as contentTypes.Ul);
      return ol.with({
        listItems: ol.listItems.map(
          li => apply(li, mappedDependencies) as contentTypes.Li).toOrderedMap(),
      });
    case 'Ul':
      const ul = (element as contentTypes.Ul);
      return ul.with({
        listItems: ul.listItems.map(
          li => apply(li, mappedDependencies) as contentTypes.Li).toOrderedMap(),
      });
    case 'Row':
      return (element as contentTypes.Row).with({
        cells: (element as contentTypes.Row).cells.map(
          cell => apply(cell, mappedDependencies) as contentTypes.CellData).toOrderedMap(),
      });
    case 'CellData':
      const c = (element as contentTypes.CellData);
      const content = c.content;

      return c.with({
        content: content.with({
          content: content.content.map(e => apply(e, mappedDependencies)).toOrderedMap(),
        }),
      });
    case 'Li':
      const li = (element as contentTypes.Li);

      return li.with({
        content: li.content.with({
          content: li.content.content.map(e => apply(e, mappedDependencies)).toOrderedMap(),
        }),
      });
    case 'ContiguousText':
      return element;
    case 'Image':
      if (mappedDependencies.has(element.guid)) {
        return (element as contentTypes.Image).with({
          src: mappedDependencies.get(element.guid).src,
        });
      }
      return element;

    default:
      return element;
  }
}
