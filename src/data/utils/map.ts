import * as Immutable from 'immutable';
import { ContentElements } from 'data/content/common/elements';
import { ContentElement } from 'data/content/common/interfaces';

export type MapFn = (e: ContentElement) => ContentElement;

// The core map routine.  Maps an entire tree of content
// elements, executing a depth first traversal and visitation.

export function map(mapper: MapFn, root: ContentElement) {

  const visited = Object.keys((root as any).toJSON()).reduce(
    (p, c) => {
      let v = root.get(c);

      if (v instanceof Immutable.OrderedMap) {
        v = (v as Immutable.OrderedMap<string, any>).map((value, key) => {
          return map(mapper, value);
        }).toOrderedMap();

      } else if (v instanceof ContentElements) {
        const ce = (v as ContentElements);
        const content = ce.content.map((value, key) => {
          return map(mapper, value);
        }).toOrderedMap();
        v = ce.with({ content: (content as Immutable.OrderedMap<string, any>) });
      } else if (v.contentType !== undefined) {
        v = map(mapper, v);
      }

      return (p as any).with({ [c]: v });
    },
    root,
  );

  return mapper(visited);
}

// Helper routine for filter impl:

export type IterableChildren = {
  key: string,
  iterable: ContentElements | Immutable.OrderedMap<string, any>,
};

// For a given content element, get a collection of all of its
// iterable properties
export function children(e: ContentElement): IterableChildren[] {
  return Object.keys((e as any).toJSON()).map(
    (c) => {
      const v = e.get(c);

      if (v instanceof Immutable.OrderedMap) {
        return { key: c, iterable: (v as Immutable.OrderedMap<string, any>) };
      }
      if (v instanceof ContentElements) {
        return { key: c, iterable: (v as ContentElements) };
      }
      return { key: c, iterable: null };
    },
  ).filter(pair => pair.iterable !== null);
}

// Filter a content element tree.  Note that the visitation
// order here is different than the map implementation. Nodes
// are visited in the traversal before their children.
export type FilterFn = (e: ContentElement) => boolean;
export function filter(fn: FilterFn, root: ContentElement) {

  let updated = root;
  children(updated).forEach((it) => {
    if (it.iterable instanceof ContentElements) {
      let ce = it.iterable as ContentElements;
      const size = ce.content.size;
      const content = ce.content.filter(fn).toOrderedMap();
      if (content.size !== size) {
        ce = ce.with({ content });
        updated = updated.with({ [it.key]: ce });
      }

    } else {
      const filtered = (it.iterable as Immutable.OrderedMap<string, any>)
        .filter(fn).toOrderedMap();
      if (filtered.size !== (it.iterable as Immutable.OrderedMap<string, any>).size) {
        updated = updated
          .with({
            [it.key]: filtered,
          });
      }
    }
  });

  return Object.keys((updated as any).toJSON()).reduce(
    (p, c) => {
      let v = updated.get(c);

      if (v instanceof Immutable.OrderedMap) {
        v = (v as Immutable.OrderedMap<string, any>).map((value, key) => {
          return filter(fn, value);
        }).toOrderedMap();

      } else if (v instanceof ContentElements) {
        const ce = (v as ContentElements);
        const content = ce.content.map((value, key) => {
          return filter(fn, value);
        }).toOrderedMap();
        v = ce.with({ content: (content as Immutable.OrderedMap<string, any>) });
      } else if (v.contentType !== undefined) {
        v = filter(fn, v);
      }

      return (p as any).with({ [c]: v });
    },
    updated,
  );
}


export type ReduceFn = (previous: any, current: ContentElement) => any;

// Reduce a ContentElement hierarchy.  Similar to map, filter implementations
// this reduce implementation will work on full ContentModels - one
// simply needs to cast the model to a ContentElement.
export function reduce(
  fn: ReduceFn, initial: any, root: ContentElement): any {

  let value = initial;
  map(
    (e) => {
      value = fn(value, e);
      return e;
    },
    root);
  return value;
}
