import { ContentBlock, ContentState } from 'draft-js';
import * as common from './common';

export type Block = {
  rawBlock: common.RawContentBlock,
  block : ContentBlock,
};

export interface BlockIterator {
  next() : Block;
  hasNext() : boolean;
  peek() : Block;
}

export interface BlockProvider {
  blocks : common.RawContentBlock[];
  state : ContentState;
  index : number;
}

export class BlockProvider implements BlockIterator {

  constructor(blocks : common.RawContentBlock[], state: ContentState) {
    this.blocks = blocks;
    this.state = state;
    this.index = 0;
  }

  next() : Block {

    if (this.index === this.blocks.length) {
      return null;
    }

    const block = {
      rawBlock: this.blocks[this.index],
      block: this.state.getBlockForKey(this.blocks[this.index].key),
    };
    this.index += 1;
    return block;
  }

  peek() : Block {

    if (this.index === this.blocks.length) {
      return null;
    }

    const block = {
      rawBlock: this.blocks[this.index],
      block: this.state.getBlockForKey(this.blocks[this.index].key),
    };
    return block;
  }

  hasNext() : boolean {
    return this.index < this.blocks.length;
  }
}
