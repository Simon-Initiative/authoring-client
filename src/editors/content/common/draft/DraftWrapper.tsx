import * as React from 'react';
import * as Immutable from 'immutable';


import {
  ContentState, Editor,
  EditorState, Modifier, SelectionState,
} from 'draft-js';

import {
  cloneDuplicatedEntities, determineChangeType,
  SelectionChangeType,
} from './utils';
import { AppServices } from '../../../common/AppServices';
import { AppContext } from '../../../common/AppContext';
import { ContiguousText } from 'data/content/learning//contiguous';
import { buildCompositeDecorator } from './decorators/composite';
import { findEntity, EntityRange } from 'data/content/learning/draft/changes';
import guid from '../../../../utils/guid';
import { updateData } from 'data/content/common/clone';
import './DraftWrapper.scss';
import parseContent from 'data/parsers/parse';
import { ParsedContent } from 'data/parsers/common/types';
import { Maybe } from 'tsmonad';

export interface DraftWrapperProps {
  onEdit: (text: ContiguousText, src?) => void;
  onSelectionChange: (state: SelectionState, keyPress: boolean) => void;
  content: ContiguousText;
  locked: boolean;
  context: AppContext;
  services: AppServices;
  editorStyles?: Object;
  singleBlockOnly: boolean;
  parentProps: Object;
  parent: any;
  onInsertParsedContent: (content: ParsedContent) => void;
  onEntitySelected?: (key: string, data: Object) => void;
  selectedEntity?: Maybe<string>;
}

interface DraftWrapperState {
  editorState: EditorState;
}

const styles = {
  editor: {
    border: 'none',
    cursor: 'text',
    minHeight: 300,
  },
};

const styleMap = {
  SUBSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    bottom: '-0.25em',
  } as any,
  SUPERSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    top: '-0.5em',
  } as any,
  CITE: {
    fontStyle: 'italic',
    textDecoration: 'underline',
  },
  TERM: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'green',
  },
  VAR: {
    fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    padding: '.2rem .4rem',
  },
  QUOTE: {
    fontStyle: 'italic',
  },
  IPA: {
    // TODO
  },
  FOREIGN: {
    fontStyle: 'italic',
  },
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
  HIGHLIGHT: {
    backgroundColor: '#FFFF00',
  },
  OBLIQUE: {
    fontStyle: 'oblique',
  },
  DEEMPHASIS: {
    fontWeight: 'lighter',
  },
  EMPHASIS: {
    fontWeight: 'bolder',
    fontStyle: 'oblique',
  },
  BDO: {
    direction: 'rtl',
    unicodeBidi: 'bidi-override',
  },
  SYM: {
    // TODO
  },
};

const blockRenderMap = Immutable.Map({
  'header-one': { element: 'h1' },
  'header-two': { element: 'h2' },
  'header-three': { element: 'h3' },
  'header-four': { element: 'h4' },
  'header-five': { element: 'h5' },
  'header-six': { element: 'h6' },
  unstyled: { element: 'div' },
});


function appendText(contentBlock, contentState, text) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: contentBlock.text.length,
    focusOffset: contentBlock.text.length,
  });

  return Modifier.insertText(
    contentState,
    targetRange,
    text);
}

function addSpaceAfterEntity(editorState, block) {
  const characterList = block.characterList;
  if (block.type !== 'atomic' && (!characterList.isEmpty() && characterList.last().getEntity())) {
    const modifiedContent = appendText(block, editorState.getCurrentContent(), ' ');
    return EditorState.push(editorState, modifiedContent, editorState.getLastChangeType());
  }

  return editorState;
}

type StateAndSeen = { editorState: EditorState, seenIds: Object };

function deDupeIds(stateAndSeen: StateAndSeen, block) {

  const { editorState, seenIds } = stateAndSeen;

  const id = block.data === undefined || block.data === null
    ? undefined
    : block.data.get('id');

  if (id !== undefined && seenIds[id]) {
    // Dedupe
    const blockData = Immutable.Map<string, string>()
      .set('id', guid())
      .set('title', '')
      .set('type', '');

    const modifiedContent = updateData(block, editorState.getCurrentContent(), blockData);
    return {
      editorState: EditorState.push(
        editorState, modifiedContent, editorState.getLastChangeType()),
      seenIds,
    };

  }
  if (id !== undefined) {
    seenIds[id] = true;
    return { editorState, seenIds };
  }

  return stateAndSeen;
}


class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState> {

  onChange: any;
  focus: () => any;
  lastSelectionState: SelectionState;
  lastContent: ContentState;
  editor: any;

  constructor(props) {
    super(props);

    this.focus = () => this.editor.focus();
    this.lastSelectionState = null;

    const contentState = props.content.content;
    this.lastContent = contentState;

    const es = EditorState.createWithContent(contentState, this.getCompositeDecorator(this.props));
    const newEditorState = EditorState.set(es, { allowUndo: false });

    this.state = {
      editorState: newEditorState,
    };

    this.onChange = (currentEditorState: EditorState) => {

      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {

        let editorState = currentEditorState;

        const ss = editorState.getSelection();
        const changeType: SelectionChangeType = determineChangeType(this.lastSelectionState, ss);
        this.lastSelectionState = ss;

        let contentState = editorState.getCurrentContent();
        const contentChange = contentState !== this.lastContent;

        if (contentChange) {

          contentState = cloneDuplicatedEntities(contentState);

          editorState = EditorState.push(editorState, contentState, 'insert-fragment');

          const blocks = contentState.getBlockMap();
          editorState = blocks.reduce(addSpaceAfterEntity, editorState);
          contentState = editorState.getCurrentContent();

          const seenIds = {};
          const result = contentState.getBlockMap().reduce(deDupeIds, { editorState, seenIds });
          editorState = result.editorState;
          contentState = editorState.getCurrentContent();

          this.lastContent = contentState;

          this.props.onSelectionChange(ss, true);

          const edit = () => {
            this.props.onEdit(this.props.content.with({ content: contentState }));
          };

          this.setState({ editorState }, edit);

        } else {

          if (changeType === SelectionChangeType.Selection
            || changeType === SelectionChangeType.CursorPosition
            || changeType === SelectionChangeType.Initial) {
            this.setState(
              { editorState },
              () => this.props.onSelectionChange(ss, false));
          } else {
            this.setState({ editorState });
          }
        }
      }
    };
  }


  forceContentChange(contentState, changeType) {
    this.lastContent = contentState;

    const editorState = EditorState.push(this.state.editorState, contentState, changeType);
    this.setState({ editorState }, () => {
      this.props.onEdit(this.props.content.with({ content: contentState }));
      this.forceRender();
    });
  }

  shouldComponentUpdate(nextProps: DraftWrapperProps, nextState: DraftWrapperState): boolean {

    if (this.props.content.content !== nextProps.content.content) {
      if (nextProps.content.content !== this.state.editorState.getCurrentContent()) {
        return true;
      }
      return false;
    }
    if (this.state.editorState.getSelection() !== nextState.editorState.getSelection()) {
      return true;
    }
    if (this.props.selectedEntity !== nextProps.selectedEntity) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps: DraftWrapperProps) {

    if (this.props.selectedEntity !== nextProps.selectedEntity) {
      this.lastContent = nextProps.content.content;
      const es = EditorState.createWithContent(
        nextProps.content.content,
        this.getCompositeDecorator(nextProps));
      const newEditorState = EditorState.set(es, { allowUndo: false });
      this.setState({ editorState: newEditorState });
      return;
    }

    if (this.props.content.content !== nextProps.content.content) {

      const current = this.state.editorState.getCurrentContent();

      if (nextProps.content.content !== current) {
        this.lastContent = nextProps.content.content;
        const newEditorState = EditorState.push(
          this.state.editorState, nextProps.content.content, 'insert-fragment');

        this.setState({
          editorState: newEditorState,
        });
      }

    } else if (this.props.content.entityEditCount !== nextProps.content.entityEditCount) {

      this.lastContent = nextProps.content.content;
      const es = EditorState.createWithContent(
        nextProps.content.content,
        this.getCompositeDecorator(nextProps));
      const newEditorState = EditorState.set(es, { allowUndo: false });
      this.setState({ editorState: newEditorState });
    }
  }

  getCompositeDecorator(props: DraftWrapperProps) {
    const onDecoratorEdit = (contentState: ContentState) => {
      this.forceContentChange(contentState, 'apply-entity');
    };
    const onContiguousTextEdit = (text: ContiguousText, src) => {
      props.onEdit(text, src);
    };

    const onSelect = (entityKey) => {
      // Force selection just before the entity


      const range: EntityRange = findEntity(
        (key, e) => entityKey === key, this.state.editorState.getCurrentContent());
      const ss: SelectionState = SelectionState.createEmpty(range.contentBlock.getKey()).merge({
        anchorKey: range.contentBlock.getKey(),
        focusKey: range.contentBlock.getKey(),
        anchorOffset: range.start,
        focusOffset: range.start,
      }) as SelectionState;

      if (props.onEntitySelected !== undefined) {
        const data = this.state.editorState.getCurrentContent().getEntity(entityKey).getData();
        props.onEntitySelected(entityKey, data);
      }

      props.onSelectionChange(ss, true);
    };
    const compositeDecorator = buildCompositeDecorator({
      selectedEntity: props.selectedEntity,
      services: props.services,
      context: props.context, onEdit: onDecoratorEdit,
      onDecoratorClick: onSelect.bind(this),
      parentProps: props.parentProps,
      parent: props.parent,
      getContiguousText: () => props.content,
      onContiguousTextEdit,
    });
    return compositeDecorator;
  }

  forceRender() {

    const editorState = this.state.editorState;
    const content = editorState.getCurrentContent();

    const es = EditorState.createWithContent(content, this.getCompositeDecorator(this.props));
    const newEditorState = EditorState.set(es, { allowUndo: false });
    this.setState({ editorState: newEditorState });
  }

  handlePastedText(text, html) {

    // Returning true prevents pasting
    if (html !== undefined && html !== null) {

      // Try parsing the html, but in case of failure, paste the plain text
      parseContent(html).caseOf({
        just: (parsedContent) => {
          setTimeout(() => this.props.onInsertParsedContent(parsedContent), 0);
        },
        nothing: () => {
          const { editorState } = this.state;
          this.onChange(EditorState.push(
            editorState, Modifier.replaceText(
              editorState.getCurrentContent(),
              editorState.getSelection(),
              text),
            'insert-fragment'),
          );
        },
      });

      return true;
    }

    // Prevent pasting in single block mode if it would introduce
    // a line break
    if (this.props.singleBlockOnly) {
      return text.indexOf('\n') !== -1;
    }
    return false;
  }

  handlePastedFragment(fragment, editorState) {

    // Returning true prevents pasting

    // We do not allow pasting fragments when in singleBlockOnly mode
    return this.props.singleBlockOnly;
  }

  handleReturn() {
    return this.props.singleBlockOnly ? 'handled' : 'not-handled';
  }

  handleCutFragment(fragment, editorState, previewEditorState) {
    // Returning false allows cutting
    return false;
  }

  onGainFocus() {
    this.props.onSelectionChange(this.state.editorState.getSelection(), false);
  }

  blockStyleFn(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'unstyled') {
      return 'draft-paragraph';
    }
  }

  render() {

    const editorStyle: any = this.props.editorStyles !== undefined
      ? Object.assign({}, this.props.editorStyles)
      : Object.assign({}, styles.editor);

    editorStyle.position = 'relative';
    editorStyle.top = '0px';
    editorStyle.left = '0px';

    return (
      <div
        className="draft-wrapper"
        style={editorStyle}
        onClick={this.focus}>

        <Editor ref={e => this.editor = e}
          onFocus={this.onGainFocus.bind(this)}
          spellCheck={true}
          stripPastedStyles={false}
          handleReturn={this.handleReturn.bind(this)}
          handlePastedText={this.handlePastedText.bind(this)}
          customStyleMap={styleMap as any}
          blockRenderMap={blockRenderMap as any}
          blockStyleFn={this.blockStyleFn.bind(this)}
          editorState={this.state.editorState}
          readOnly={this.props.locked}
          onChange={this.onChange} />

      </div>
    );
  }

}

export default DraftWrapper;
