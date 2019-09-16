import { ContentModel } from '../../models';
import { ContentElement } from '../../content/common/interfaces';
import { ContiguousText, InlineEntities } from '../../content/learning/contiguous';
import { filter, reduce } from '../../utils/map';

export function validateRemoval(model: ContentModel, itemToRemove: ContentElement): boolean {

  // Simulate removing the element
  const removed = filter(
    e => e !== itemToRemove,
    (model as any) as ContentElement);

  // Now get a map of all ids that remain in the tree and
  // a list of all targets from all Command elements
  const info = reduce(
    (p, e) => {
      if (e.id !== undefined) {
        p[0][e.id] = true;
      }
      if (e.contentType === 'Command') {
        p[1].push(e.target);
      }
      if (e.contentType === 'ContiguousText') {
        const ct = e as ContiguousText;

        ct.getEntitiesByType(InlineEntities.Command).forEach((e) => {
          p[1].push(e.data.get('value').target);
        });
      }
      return p;
    },
    [{}, []],
    removed,
  );

  // Make sure all targets are still present
  return info[1].every(id => info[0][id]);
}
