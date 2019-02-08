
import { getChildren } from '../common';
import { getKey } from '../../common';

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

export interface Author {
  type: 'author';
  author: string;
}

export function makeAuthor(author: string): Author {
  return {
    type: 'author',
    author,
  };
}

export interface Editor {
  type: 'editor';
  editor: string;
}

export function makeEditor(editor: string): Editor {
  return {
    type: 'editor',
    editor,
  };
}

export type AuthorOrEditor = Author | Editor;


export interface Volume {
  type: 'volume';
  volume: string;
}

export interface Number {
  type: 'number';
  number: string;
}


export function makeVolume(volume: string): Volume {
  return {
    type: 'volume',
    volume,
  };
}


export function makeNumber(number: string): Number {
  return {
    type: 'number',
    number,
  };
}

export type VolumeOrNumber = Volume | Number;
