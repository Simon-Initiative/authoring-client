import * as Immutable from 'immutable';
import { Value } from 'slate';
import { augment } from './common';
import guid from 'utils/guid';
import Html from 'slate-html-serializer';

export const renderNode = (props, editor, next) => {
  switch (props.node.type) {
    case 'paragraph':
      return (
        <p {...props.attributes} className={props.node.data.get('className')}>
          {props.children}
        </p>
      );
    default:
      return next();
  }
};

export const renderMark = (props, editor, next) => {
  const { mark, attributes } = props;
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{props.children}</strong>;
    case 'italic':
      return <em {...attributes}>{props.children}</em>;
    case 'underline':
      return <u {...attributes}>{props.children}</u>;
    case 'strikethrough':
      return <s {...attributes}>{props.children}</s>;
    case 'highlight':
      return <mark {...attributes}>{props.children}</mark>;
    case 'code':
      return <code {...attributes}>{props.children}</code>;
    case 'superscript':
      return <sup {...attributes}>{props.children}</sup>;
    case 'subscript':
      return <sub {...attributes}>{props.children}</sub>;
    default:
      return next();
  }
};

const BLOCK_TAGS = {
  p: 'paragraph',
};

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'stikethrough',
  mark: 'highlight',
  code: 'code',
  sup: 'superscript',
  sub: 'subscript',
};

const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'block',
          type,
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'mark',
          type,
          nodes: next(el.childNodes),
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underline':
            return <u>{children}</u>;
          case 'strikethrough':
            return <s>{children}</s>;
          case 'highlight':
            return <mark>{children}</mark>;
          case 'superscript':
            return <sup>{children}</sup>;
          case 'subscript':
            return <sub>{children}</sub>;
          case 'code':
            return <code>{children}</code>;
        }
      }
    },
  },
];

const html = new Html({ rules });

export type RichTextParams = Partial<{
  guid: string,
  value: Value,
}>;

const defaultParams = () => ({
  contentType: 'RichText',
  guid: guid(),
  value: new Value,
});

export class RichText extends Immutable.Record(defaultParams()) {
  contentType: 'RichText';
  guid: string;
  value: Value;

  constructor(params?: RichTextParams) {
    params ? super(augment(params)) : super(defaultParams());
  }

  with(values: RichTextParams) {
    return this.merge(values) as this;
  }

  static fromHtml(htmlText: string, guid?: string): RichText {
    return new RichText({
      guid,
      value: html.deserialize(htmlText),
    });
  }

  toHtml(): string {
    return html.serialize(this.value);
  }

  static fromPersistence(root: string, guid?: string): RichText {
    return RichText.fromHtml(root, guid);
  }

  toPersistence(): string {
    return this.toHtml();
  }
}
