
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
