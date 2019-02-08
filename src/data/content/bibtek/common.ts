
import { getChildren } from '../common';
import { getKey } from '../../common';
import * as Immutable from 'immutable';

export function indexText(o) {
  return getChildren(o).reduce(
    (p, c) => {
      const key = getKey(c);
      const asAttribute = key.replace('bib:', '@');
      p[asAttribute] = c[key]['#text'];
      return p;
    },
    {},
  );
}

export function toElements(root, key) {
  const c = Object.keys(root[key]).reduce(
    (p, c) => {
      p.push({
        [c.replace('@', 'bib:')]: { '#text': root[key][c] },
      });
      return p;
    },
    [],
  );

  return {
    [key]: {
      '#array': c,
    },
  };
}

export function el(name: string, value: string) {
  return {
    [name]: {
      '#text': value,
    },
  };
}

export function makeAuthor(v: string): Immutable.Map<string, string> {
  return Immutable.Map<string, string>().set('author', v);
}

export function makeEditor(v: string): Immutable.Map<string, string> {
  return Immutable.Map<string, string>().set('editor', v);
}


export function makeVolume(v: string): Immutable.Map<string, string> {
  return Immutable.Map<string, string>().set('volume', v);
}


export function makeNumber(v: string): Immutable.Map<string, string> {
  return Immutable.Map<string, string>().set('number', v);
}

