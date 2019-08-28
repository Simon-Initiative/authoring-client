import * as React from 'react';
import * as Immutable from 'immutable';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { Math as MathRenderer } from 'utils/math/Math';
import { Tooltip } from 'utils/tooltip';

import './SlateTestbed.scss';

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: 'A line of text in a paragraph.',
          },
        ],
      },
    ],
  },
});

function wrapQuote(editor) {
  editor.wrapInline({
    type: 'quote',
  });

  editor.moveToEnd();
}

function wrapLink(editor, href) {
  editor.wrapInline({
    type: 'link',
    data: { href },
  });

  editor.moveToEnd();
}

/**
 * A change helper to standardize unwrapping links.
 *
 * @param {Editor} editor
 */

function unwrapLink(editor) {
  editor.unwrapInline('link');
}

function unwrapQuote(editor) {
  editor.unwrapInline('quote');
}

export interface SlateTestbedProps {

}

export interface SlateTestbedState {
  value;
}

function MarkHotkey(options) {
  const { type, key } = options;

  // Return our "plugin" object, containing the `onKeyDown` handler.
  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if (!event.ctrlKey || event.key != key) return next();

      // Prevent the default characters from being inserted.
      event.preventDefault();

      // Toggle the mark `type`.
      editor.toggleMark(type);
    },
  };
}

const plugins = [
  MarkHotkey({ key: 'b', type: 'bold' }),
  MarkHotkey({ key: '`', type: 'code' }),
  MarkHotkey({ key: 'i', type: 'italic' }),
  MarkHotkey({ key: '~', type: 'strikethrough' }),
  MarkHotkey({ key: 'h', type: 'highlight' }),
];

export class SlateTestbed
  extends React.PureComponent<SlateTestbedProps, SlateTestbedState> {

  editor;

  constructor(props) {
    super(props);

    this.state = { value: initialValue };
  }

  onChange = ({ value }) => {
    console.log(value);
    this.setState({ value });
  }

  renderMark = (props, editor, next) => {
    switch (props.mark.type) {
      case 'bold':
        return <strong>{props.children}</strong>;
      // Add our new mark renderers...
      case 'code':
        return <code>{props.children}</code>;
      case 'italic':
        return <em>{props.children}</em>;
      case 'strikethrough':
        return <del>{props.children}</del>;
      case 'highlight':
        return <mark>{props.children}</mark>;
      default:
        return next();
    }
  }


  hasLinks = () => {
    const { value } = this.state;
    return value.inlines.some(inline => inline.type === 'link');
  }


  hasQuotes = () => {
    const { value } = this.state;
    return value.inlines.some(inline => inline.type === 'quote');
  }

  addLink = (event) => {
    event.preventDefault();

    const editor = this.editor;
    const { value } = editor;
    const hasLinks = this.hasLinks();

    if (hasLinks) {
      editor.command(unwrapLink);
    } else if (value.selection.isExpanded) {
      const href = window.prompt('Enter the URL of the link:');

      if (href == null) {
        return;
      }

      editor.command(wrapLink, href);
    } else {
      const href = window.prompt('Enter the URL of the link:');

      if (href == null) {
        return;
      }

      const text = window.prompt('Enter the text for the link:');

      if (text == null) {
        return;
      }

      editor
        .insertText(text)
        .moveFocusBackward(text.length)
        .command(wrapLink, href);
    }
  }


  addQuote = (event) => {
    event.preventDefault();

    const editor = this.editor;
    const { value } = editor;
    const hasQuotes = this.hasQuotes();

    if (hasQuotes) {
      editor.command(unwrapQuote);
    } else if (value.selection.isExpanded) {

      editor.command(wrapQuote);
    }
  }

  addFillInTheBlank = (event) => {
    event.preventDefault();

    const editor = this.editor;
    const { value } = editor;

    if (!value.selection.isExpanded) {
      editor.insertInline({
        data: {
          type: 'FillInTheBlank',
        },
        type: 'input',
      });
    }
  }


  addMathML = (event) => {
    event.preventDefault();

    const editor = this.editor;
    const { value } = editor;

    if (!value.selection.isExpanded) {
      editor.insertInline({
        data: {
          src: `<math><mrow>
          <msup>
            <mfenced>
              <mrow>
                <mi>a</mi>
                <mo>+</mo>
                <mi>b</mi>
              </mrow>
            </mfenced>
            <mn>2</mn>
          </msup>
        </mrow></math>`,
        },
        type: 'math',
      });
    }
  }


  addImage = (event) => {
    event.preventDefault();

    const editor = this.editor;
    const { value } = editor;

    if (!value.selection.isExpanded) {
      editor.insertInline({
        data: {
          src: 'https://via.placeholder.com/50',
        },
        type: 'image',
      });
    }
  }

  renderInline = (props, editor, next) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'link': {
        const { data } = node;
        const href = data.get('href');
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      }
      case 'input': {
        const { data } = node;
        const type = data.get('type');
        return (
          <input readOnly value="Numeric" size={15} />
        );
      }
      case 'math': {
        const { data } = node;
        const src = data.get('src');
        return (

          <MathRenderer inline >{src}</MathRenderer>

        );
      }
      case 'image': {
        const { data } = node;
        const src = data.get('src');
        return (
          <Tooltip title="This is your image" delay={1000} size="small" arrowSize="small">
            <img src={src} />
          </Tooltip>

        );
      }
      case 'quote': {

        return (
          <span>&quot;{children}&quot;</span>
        );
      }

      default: {
        return next();
      }
    }
  }

  renderButtons() {
    return (
      <div>
        <button onClick={this.addLink}>Add Link</button>
        <button onClick={this.addFillInTheBlank}>Add FillInTheBlank</button>
        <button onClick={this.addMathML}>Add Math</button>
        <button onClick={this.addImage}>Add Image</button>
        <button onClick={this.addQuote}>Add Quote</button>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div style={{
          margin: '20px', width: 600,
          height: 600, borderWidth: 1, borderStyle: 'solid',
        }}>
          <Editor
            ref={editor => this.editor = editor}
            plugins={plugins}
            value={this.state.value}
            onChange={this.onChange}
            renderMark={this.renderMark}
            renderInline={this.renderInline}
          />

        </div>

        {this.renderButtons()}

        <pre>
          {JSON.stringify(this.state.value, null, 3)}
        </pre>
      </div>
    );
  }
}
