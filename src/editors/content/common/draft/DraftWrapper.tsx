import * as React from 'react';
import * as Immutable from 'immutable';

import { Maybe } from 'tsmonad';

import {
  CharacterMetadata, ContentBlock, ContentState, Editor,
  EditorState, Modifier, RichUtils, SelectionState,
} from 'draft-js';
import { Command, CommandProcessor } from '../command';

import {
    cloneDuplicatedEntities, determineChangeType, getCursorPosition, getPosition, hasSelection,
    SelectionChangeType,
} from './utils';
import { AppServices } from '../../../common/AppServices';
import { AppContext } from '../../../common/AppContext';
import * as common from 'data/content/learning/common';
import { ContiguousText } from 'data/content/learning//contiguous';
import { buildCompositeDecorator } from './decorators/composite';
import { insertBlocksAfter } from './commands/common';

import guid from '../../../../utils/guid';
import { updateData } from 'data/content/common/clone';
import './DraftWrapper.scss';


const SHIFT_KEY = 16;
const ALT_KEY = 18;

export interface DraftWrapperProps {
  onEdit: (text : ContiguousText) => void;
  onSelectionChange: (state: SelectionState) => void;
  content: ContiguousText;
  undoRedoGuid: string;
  locked: boolean;
  context: AppContext;
  services: AppServices;
  activeItemId: string;
  editorStyles?: Object;
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
  },
  SUPERSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    top: '-0.5em',
  },
  CITE: {
    fontStyle: 'italic',
    textDecoration: 'underline',
  },
  TERM: {
    textDecoration: 'underline',
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


class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState>
  implements CommandProcessor<EditorState> {

  onChange: any;
  focus: () => any;
  lastSelectionState: SelectionState;
  lastContent: ContentState;
  container: any;

  constructor(props) {
    super(props);

    this.focus = () => (this.refs as any).editor.focus();
    this.lastSelectionState = null;

    const contentState = props.content.content;
    this.lastContent = contentState;

    const es = EditorState.createWithContent(contentState, this.getCompositeDecorator());
    const newEditorState = EditorState.set(es, { allowUndo: false });

    this.state = {
      editorState: newEditorState,
    };

    this.onChange = (currentEditorState : EditorState) => {

      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {

        let editorState = currentEditorState;

        const ss = editorState.getSelection();
        const changeType : SelectionChangeType = determineChangeType(this.lastSelectionState, ss);
        this.lastSelectionState = ss;

        let contentState = editorState.getCurrentContent();
        const contentChange = contentState !== this.lastContent;

        if (contentChange) {

          contentState = cloneDuplicatedEntities(contentState);

          editorState = EditorState.push(editorState, contentState);

          const blocks = contentState.blockMap;
          editorState = blocks.reduce(addSpaceAfterEntity, editorState);
          contentState = editorState.getCurrentContent();

          const seenIds = {};
          const result = contentState.blockMap.reduce(deDupeIds, { editorState, seenIds });
          editorState = result.editorState;
          contentState = editorState.getCurrentContent();

          this.lastContent = contentState;
          this.setState(
            { editorState },
            () => this.props.onEdit(new ContiguousText({ content: contentState,
              guid: this.props.content.guid })));
        } else {
          this.setState({ editorState });
        }


      }
    };
  }

  forceContentChangeWithSelection(contentState, changeType, selection) {
    this.lastContent = contentState;

    const es = EditorState.push(this.state.editorState, contentState, changeType);
    const editorState = EditorState.forceSelection(
      EditorState.set(es, { allowUndo: false }), selection);

    this.setState({ editorState }, () => {

      this.props.onEdit(new ContiguousText({ content: contentState }));
      this.forceRender();
    });
  }

  forceContentChange(contentState, changeType) {
    this.lastContent = contentState;

    const editorState = EditorState.push(this.state.editorState, contentState, changeType);
    this.setState({ editorState }, () => {
      this.props.onEdit(new ContiguousText({ content: contentState }));
      this.forceRender();
    });
  }

  insertEmptyBlockAfter(key) {

    const emptyCharList = Immutable.List().push(new CharacterMetadata());

    const blocks = [
      new ContentBlock({
        type: 'unstyled',
        text: ' ',
        key: common.generateRandomKey(),
        characterList: emptyCharList,
      }),
    ];

    const contentState = insertBlocksAfter(
      this.state.editorState.getCurrentContent(),
      key, blocks);

    const newKey = blocks[0].key;

    const selection = new SelectionState({
      anchorKey: newKey,
      focusKey: newKey,
      anchorOffset: 0,
      focusOffset: 0,
    });

    this.forceContentChangeWithSelection(
      contentState, 'insert-fragment', selection);
  }



  componentWillReceiveProps(nextProps: DraftWrapperProps) {

    if (this.props.activeItemId !== nextProps.activeItemId) {
      setTimeout(() => this.forceRender(), 100);

    } else if (this.props.content.content !== nextProps.content.content) {

      const current = this.state.editorState.getCurrentContent();

      if (nextProps.content.content !== current
        && nextProps.undoRedoGuid !== this.props.undoRedoGuid) {

        this.lastContent = nextProps.content.content;
        const newEditorState = EditorState.push(
          this.state.editorState, nextProps.content.content);

        this.setState({
          editorState: newEditorState,
        });
      }

    }
  }

  process(command: Command<EditorState>) {
    command.execute(this.state.editorState, this.props.context, this.props.services)
      .then(newState => this.onChange(newState));
  }

  checkPrecondition(command: Command<EditorState>) {
    return command.precondition(this.state.editorState, this.props.context);
  }

  getCompositeDecorator() {
    const onDecoratorEdit = (contentState: ContentState) => {
      this.forceContentChange(contentState, 'apply-entity');
    };
    const compositeDecorator = buildCompositeDecorator({
      activeItemId: this.props.activeItemId, services: this.props.services,
      context: this.props.context, onEdit: onDecoratorEdit,
    });
    return compositeDecorator;
  }

  forceRender() {

    const editorState = this.state.editorState;
    const content = editorState.getCurrentContent();

    const es = EditorState.createWithContent(content, this.getCompositeDecorator());
    const newEditorState = EditorState.set(es, { allowUndo: false });
    this.setState({ editorState: newEditorState });
  }

  isAtEmptyBlock() : boolean {
    const ss = this.state.editorState.getSelection();

    if (ss.getAnchorKey() === ss.getFocusKey()) {
      if (ss.getAnchorOffset() === 0 && ss.getFocusOffset() === 0) {

        const block = this.state.editorState.getCurrentContent().getBlockForKey(ss.getAnchorKey());
        return block.type === 'unstyled' && block.text === '';
      }
    }

    return false;
  }

  handlePastedText(text, html) {

    return false;
  }

  handlePastedFragment(fragment, editorState) {
    return false;
  }

  handleCutFragment(fragment, editorState, previewEditorState) {
    return false;
  }

  render() {

    const editorStyle : any = this.props.editorStyles !== undefined
      ? Object.assign({}, this.props.editorStyles)
      : Object.assign({}, styles.editor);

    editorStyle.position = 'relative';
    editorStyle.top = '0px';
    editorStyle.left = '0px';

    return (
        <div
          className="draft-wrapper"
          ref={(container => this.container = container)}
          style={editorStyle}
          onClick={this.focus}>

          <Editor ref="editor"
            spellCheck={true}
            stripPastedStyles={false}
            handleCutFragment={this.handleCutFragment.bind(this)}
            handlePastedText={this.handlePastedText.bind(this)}
            handlePastedFragment={this.handlePastedFragment.bind(this)}
            customStyleMap={styleMap}
            blockRenderMap={blockRenderMap}
            editorState={this.state.editorState}
            readOnly={this.props.locked}
            onChange={this.onChange} />

      </div>
    );
  }

}

export default DraftWrapper;
