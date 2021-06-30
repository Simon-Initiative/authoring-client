import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { augment } from 'data/content/common';
import guid from 'utils/guid';
import { Value, Block, Inline } from 'slate';
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

export type ContiguousTextParams = {
  slateValue?: Value,
  forcedUpdateCount?: number,
  mode?: ContiguousTextMode,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  elementType: '#text',
  slateValue: valueFromText(''),
  mode: ContiguousTextMode.Regular,
  forcedUpdateCount: 0,
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
  Code = 'code',
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
  slateValue: Value;
  mode: ContiguousTextMode;
  guid: string;

  // This is used to 'force' the contiguous text editor to re-render.
  // That component, by design, ignores parent props pushed down to
  // it, and instead maintains its 'source of truth' in local state.
  // Almost all edits in contiguous text are triggered from that
  // component, so they get captured in local state before they bubble up.
  // There are some edits, like undo and redo, and citation removal, where
  // the edits cannot bubble up and instead must be pushed down. To force
  // the component to not ignore these pushed down models, we tick this
  // update count.  In ContiguousTextEditor::componentWillReceiveProps we
  // check to see if the update count has changed, if so, we update state
  // from the new model.
  forcedUpdateCount: number;

  constructor(params?: ContiguousTextParams) {
    super(augment(params));
  }

  with(values: ContiguousTextParams) {
    return this.merge(values) as this;
  }

  clone(): ContiguousText {
    return this.assignNewIds();
  }

  static fromPersistence(
    root: Object[], guid: string, mode = ContiguousTextMode.Regular,
    backingTextProvider: Object = null): ContiguousText {
    return new ContiguousText({
      guid,
      mode,
      slateValue: toSlate(root, mode === ContiguousTextMode.SimpleText, backingTextProvider),
    });
  }

  static fromText(text: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {
    return new ContiguousText({ guid, mode, slateValue: valueFromText(text) });
  }

  // Creates a new ContiguousText, but with all of the block level ids changed
  assignNewIds(): ContiguousText {
    const nodes = this.slateValue.document.nodes.map((node) => {
      const data = { id: guid() };
      return node.merge({ data });
    });
    const document = this.slateValue.document.merge({ nodes });
    const slateValue = this.slateValue.merge({ document }) as Value;
    return this.with({ slateValue });
  }

  toPersistence(): Object {
    return toPersistence(this.slateValue, this.mode === ContiguousTextMode.SimpleText);
  }

  // Return the OLI ID of the first paragraph in the text block
  getFirstReferenceId(): string | undefined {
    const firstBlock = this.slateValue.document.nodes.first() as Block;
    if (firstBlock) {
      return firstBlock.data.get('id');
    }
    return undefined;
  }


  // Get all entities of a certain type.
  getEntitiesByType(type: InlineEntities): Inline[] {
    return this.slateValue.document.nodes
      .toArray()
      .reduce(
        (p, c) => {
          return (c as Block).nodes.toArray().reduce(
            (p1, c1) => {
              if (c1.object === 'inline' && c1.data.get('value').contentType === type) {
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
          p[c.data.get('value').input] = c;
          return p;
        },
        {});
  }

  // Update all Input Ref wrappers from the given map of
  // item ids to input refs.
  updateInputRefs(itemMap: Object): ContiguousText {
    const nodes = this.slateValue.document.nodes.map((n) => {
      const block = n as Block;
      const nodes = block.nodes.map((m) => {
        if (m.object === 'inline' && m.type === 'InputRef') {
          const i = m.data.get('value');
          const mapped = itemMap[i.input];
          if (mapped !== undefined) {
            const data = m.data.merge({
              value: i.with({ input: itemMap[i.input] }),
            });
            return m.merge({ data });
          }
        }
        return m;
      }).toList();
      return block.merge({ nodes });
    }).toList();

    const document = this.slateValue.document.merge({ nodes });
    const slateValue = this.slateValue.merge({ document }) as Value;
    return this.with({ slateValue });
  }

  // Remove the inline specified by the given key
  removeInlineEntity(key: string): ContiguousText {

    let removed = false;
    const nodes = this.slateValue.document.nodes.map((n) => {
      const block = n as Block;
      const nodes = block.nodes.filter((m) => {
        if (m.key === key) {
          removed = true;
        }
        return m.key !== key;
      }).toList();
      return block.merge({ nodes });
    }).toList();

    const document = this.slateValue.document.merge({ nodes });
    const slateValue = this.slateValue.merge({ document }) as Value;
    const forcedUpdateCount = removed ? this.forcedUpdateCount + 1 : this.forcedUpdateCount;

    return this.with({ slateValue, forcedUpdateCount });
  }

  // Extract the plain text of the first block of this text
  extractPlainText(): Maybe<string> {

    if (this.slateValue.document.nodes.size > 0) {
      const n = this.slateValue.document.nodes.first() as Block;
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


}
