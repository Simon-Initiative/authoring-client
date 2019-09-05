import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import { augment, ensureIdGuidPresent } from 'data/content/common';

import { Value, Block, Inline, Text, Selection } from 'slate';
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
  forcedUpdateCount: number;
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
      slateValue: toSlate(root, mode === ContiguousTextMode.SimpleText, backingTextProvider),
    });
  }

  static fromText(text: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {
    return new ContiguousText({ guid, mode, slateValue: valueFromText(text) });
  }

  static fromHTML(html: string, guid: string, mode = ContiguousTextMode.Regular): ContiguousText {
    return new ContiguousText({ guid, mode, slateValue: Html.deserialize(html) });
  }

  toPersistence(): Object {
    return toPersistence(this.slateValue, this.mode === ContiguousTextMode.SimpleText);
  }

  // Return the OLI ID of the first paragraph in the text block
  getFirstReferenceId(): string | undefined {
    const firstBlock = this.slateValue.document.nodes[0];
    if (firstBlock) {
      return firstBlock.data.get('id');
    }
    return undefined;
  }


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

  updateInputRefs(itemMap: Object): ContiguousText {
    const nodes = this.slateValue.document.nodes.map((n) => {
      const block = n as Block;
      const nodes = block.nodes.map((m) => {
        if (m.object === 'inline' && m.type === 'InputRef') {
          const i = m.data.get('value');
          const mapped = itemMap[i.input];
          if (mapped !== undefined) {
            const data = m.data.merge({ value: itemMap[i.input] });
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

  addInlineEntity(wrapper: InlineTypes, selection: Selection): ContiguousText {

    const inline = Inline.create({
      text: '',
      type: wrapper.contentType,
      data: { value: wrapper },
    });

    const { offset, path } = selection.anchor;

    const nodes = Immutable.List(this.slateValue.document.nodes
      .toArray()
      .reduce(
        (arr, n: Block, i) => {
          if (i === path.get(0)) {
            const text = n.text;

            if (offset === 0) {
              arr.push(n.merge({ nodes: n.nodes.insert(0, inline) }));
              return arr;

            }
            if (offset === text.length - 1) {
              arr.push(n.merge({ nodes: n.nodes.push(inline) }));
              return arr;
            }

            const nodes = n.nodes.toArray();

            const t = n.nodes.get(path.get(1)).text;
            const text1 = Text.create({ text: t.substr(0, offset) });
            const text2 = Text.create({ text: t.substr(offset) });

            nodes.splice(path.get(1), 1, text1, inline, text2);

            arr.push(n.merge({ nodes: Immutable.List(nodes) }));
            return arr;


          }
          arr.push(n);
          return arr;
        },
        [],
      ));

    const document = this.slateValue.document.merge({ nodes });
    const slateValue = this.slateValue.merge({ document }) as Value;
    const forcedUpdateCount = this.forcedUpdateCount + 1;

    return this.with({ slateValue, forcedUpdateCount });
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
