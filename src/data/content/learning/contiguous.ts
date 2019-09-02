import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { augment, ensureIdGuidPresent } from 'data/content/common';
import { TextSelection } from 'types/active';

import { Value, Block, Inline, Document } from 'slate';
import Html from 'slate-html-serializer';
import { toSlate } from 'data/content/learning/slate/toslate';
import { toPersistence } from 'data/content/learning/slate/topersistence';

export type ContiguousTextPair = [ct.ContiguousText, ct.ContiguousText];

function valueFromText(text: string) {
  return Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          nodes: [
            {
              object: 'text',
              text,
            },
          ],
        },
      ],
    },
  });
}

export enum ContiguousTextMode {
  Regular,
  SimpleText,
}

export type InputRefChanges = {
  additions: Immutable.List<ct.InputRef>;
  deletions: Immutable.List<ct.InputRef>;
};

export type ContiguousTextParams = {
  value?: Value,
  entityEditCount?: number,
  mode?: ContiguousTextMode,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  elementType: '#text',
  value: valueFromText(''),
  mode: ContiguousTextMode.Regular,
  entityEditCount: 0,
  guid: '',
};


export enum InlineStyles {
  Bold = 'em',
  Italic = 'italic',
  Strikethrough = 'line-through',
  Highlight = 'highlight',
  Var = 'var',
  Term = 'term',
  Foreign = 'foreign',
  Subscript = 'sub',
  Superscript = 'sup',
  BidirectionTextOverride = 'bdo',
}

export enum InlineEntities {
  Cite = 'Cite',
  Link = 'Link',
  ActivityLink = 'ActivityLink',
  Xref = 'Xref',
  Command = 'Command',
  Quote = 'Quote',
  Extra = 'Extra',
  Math = 'Math',
  InputRef = 'InputRef',
  Image = 'Image',
  Sym = 'Sym',
  Code = 'Code',
}

export type InlineTypes =
  ct.Cite | ct.Link | ct.ActivityLink | ct.Xref | ct.Command |
  ct.Quote | ct.Extra | ct.Math | ct.InputRef | ct.Image | ct.Sym | ct.Code;

export class ContiguousText extends Immutable.Record(defaultContent) {

  contentType: 'ContiguousText';
  elementType: '#text';
  value: Value;
  entityEditCount: number;
  mode: ContiguousTextMode;
  guid: string;

  constructor(params?: ContiguousTextParams) {
    super(augment(params));
  }

  with(values: ContiguousTextParams) {
    return this.merge(values) as this;
  }

  clone(): ContiguousText {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(
    root: Object[], guid: string, mode = ContiguousTextMode.Regular,
    backingTextProvider: Object = null): ContiguousText {
    return new ContiguousText({
      guid,
      mode,
      value: toSlate(root, mode === ContiguousTextMode.SimpleText, backingTextProvider),
    });
  }

  static fromText(text: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {
    return new ContiguousText({ guid, mode, value: valueFromText(text) });
  }

  static fromHTML(html: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {
    return new ContiguousText({ guid, mode, value: Html.deserialize(html) });
  }

  toPersistence(): Object {
    return toPersistence(this.value, this.mode === ContiguousTextMode.SimpleText);
  }

  // Return the OLI ID of the first paragraph in the text block
  getFirstReferenceId(): string | undefined {
    const firstBlock = this.value.document.nodes[0];
    if (firstBlock) {
      return firstBlock.data.get('id');
    }
    return undefined;
  }

  getEntityAtCursor(): Maybe<Inline> {
    return this.value.inlines.size === 0
      ? Maybe.nothing()
      : Maybe.just(this.value.inlines.first());
  }

  getEntitiesByType(type: InlineEntities): Inline[] {
    return this.value.document.nodes
      .toArray()
      .reduce(
        (p, c) => {
          return (c as Block).nodes.toArray().reduce(
            (p1, c1) => {
              if (c1.object === 'inline' && c1.data.value.contentType === type) {
                p1.push(c1);
              }
              return p1;
            },
            p,
          );
        },
        [] as Inline[],
      );
  }

  keyedByInput(inlines: Inline[]): Object {
    return inlines
      .reduce(
        (p, c) => {
          p[c.data.value.input] = c;
          return p;
        },
        {});
  }

  detectInputRefChanges(prev: ContiguousText): InputRefChanges {

    let additions = Immutable.List<ct.InputRef>();
    let deletions = Immutable.List<ct.InputRef>();

    const prevEntities = this.keyedByInput(prev.getEntitiesByType(InlineEntities.InputRef));
    const currentEntities = this.keyedByInput(this.getEntitiesByType(InlineEntities.InputRef));

    for (const key in prevEntities) {
      if (currentEntities[key] === undefined) {
        deletions = deletions.push(prevEntities[key]);
      }
    }
    for (const key in currentEntities) {
      if (prevEntities[key] === undefined) {
        additions = additions.push(currentEntities[key]);
      }
    }

    return {
      additions,
      deletions,
    };
  }

  // Returns true if the contiguous text contains one block and
  // the text in that block is empty or contains all spaces
  isEffectivelyEmpty(): boolean {
    return this.value.document.nodes.size === 1
      && this.value.document.nodes[0].object === 'text'
      && this.value.document.nodes[0].text.trim() === '';
  }

  // Returns true if the selection is collapsed and the cursor is
  // positioned in the last block and no text other than spaces
  // follows the cursor
  isCursorAtEffectiveEnd(textSelection: TextSelection): boolean {
    const node = (this.value.document.nodes.get(this.value.document.nodes.size - 1) as Block);
    const { key, text } = node;

    return textSelection.isCollapsed()
      && key === textSelection.getAnchorKey()
      && (text.length <= textSelection.getAnchorOffset()
        || text.substr(textSelection.getAnchorOffset()).trim() === '');
  }

  // Returns true if the selection is collapsed and is at the
  // very beginning of the first block
  isCursorAtBeginning(textSelection: TextSelection): boolean {
    const key = (this.value.document.nodes.get(0) as Block).key;
    return textSelection.isCollapsed()
      && key === textSelection.getAnchorKey()
      && textSelection.getAnchorOffset() === 0;
  }

  updateInlineData(key: string, wrapper: InlineTypes): ContiguousText {

    const nodes = this.value.document.nodes.map((n: Block) => {
      return n.nodes.map((inner) => {
        if (inner.key === key) {
          const data = { value: wrapper };
          return inner.merge({ data });
        }
        return inner;
      });
    });

    const document = this.value.document.merge({ nodes }) as Document;
    const value = this.value.merge({ document }) as Value;
    return this.with({ value });
  }

  updateAllInputRefs(itemMap: Object): ContiguousText {

    const nodes = this.value.document.nodes.map((n: Block) => {
      return n.nodes.map((inner) => {
        if (inner.object === 'inline'
          && inner.data.value.contentType === 'InputRef'
          && itemMap[inner.data.value.input] !== undefined) {

          const data = { value: itemMap[inner.data.value.input] };
          return inner.merge({ data });
        }
        return inner;
      });
    });

    const document = this.value.document.merge({ nodes }) as Document;
    const value = this.value.merge({ document }) as Value;
    return this.with({ value });

  }

  extractPlainText(): Maybe<string> {

    if (this.value.document.nodes.size > 0) {
      const n = this.value.document.nodes.first() as Block;
      let s = '';
      n.nodes.forEach((t) => {
        if (t.object === 'text') {
          s += t.text;
        } else if (t.object === 'inline') {
          t.nodes.forEach((tn) => {
            if (tn.object === 'text') {
              s += tn.text;
            }
          });
        }
      });
      return Maybe.just(s);
    }
    return Maybe.nothing();
  }

  // Accesses the plain text from a selection with a single
  // paragraph of continguous text.  If the selection spans
  // multiple content blocks (i.e. paragraphs) we return Nothing. If
  // the block is not found or the selection offsets exceed the
  // length of the raw text for the block, we return nothing.
  // Otherwise, we return just the raw underlying text substring.

  extractParagraphSelectedText(selection: TextSelection): Maybe<string> {

    return Maybe.nothing();
  }
}
