'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import {Editor, EditorState, CompositeDecorator, ContentState, SelectionState,
  ContentBlock, convertFromRaw, convertToRaw, AtomicBlockUtils, RichUtils} from 'draft-js';
import { determineChangeType, SelectionChangeType } from './utils';
import * as translate from './translate';
import { AuthoringActions } from '../../../../actions/authoring';
import { AppServices } from '../../../common/AppServices';

import { HtmlContent } from '../../../../data/contentTypes';

import { getActivityByName, Activity } from '../../../../activity/registry';

interface DraftWrapper {
  onChange: any;
  focus: () => any; 
  handleKeyCommand: any;
  lastSelectionState: SelectionState;
}

export interface DraftWrapperProps {
  editHistory: AuthoringActions[];
  onEdit: (HtmlContent) => void;
  onSelectionChange: (state: SelectionState) => void;
  onEditModeChange: (key: string, mode: boolean) => void;
  content: HtmlContent;
  locked: boolean;
  userId: string;
  services: AppServices;
}



interface DraftWrapperState {
  editorState: EditorState;
  inEdit: boolean;
}

const styles = {
  root: {
    fontFamily: '\'Helvetica\', sans-serif',
    padding: 20,
    width: 600,
  },
  editor: {
    border: 'none',
    cursor: 'text',
    minHeight: 300,
    padding: 10,
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  link: {

  }
};

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

const blockRenderMap = Immutable.Map({
  'header-one': { element: 'h1' },
  'header-two': { element: 'h2' },
  'header-three': { element: 'h3' },
  'header-four': { element: 'h4' },
  'header-five': { element: 'h5' },
  'header-six': { element: 'h6' },
  'blockquote': { element: 'blockquote' },
  'code-block': { element: 'pre' },
  'atomic': { element: 'div' },
  'unordered-list-item': { element: 'li' },
  'ordered-list-item': { element: 'li' },
  'unstyled': { element: 'div' }
});


const ActivityFactory = (props) => {
  const entity = props.contentState.getEntity(
    props.block.getEntityAt(0)
  );
  const data = entity.getData();
  const type = entity.getType();

  let viewer = getActivityByName(type).viewer;

  let childProps = Object.assign({}, props, data);

  return React.createElement((viewer as any), childProps);
};


function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url} = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} target='_blank' style={styles.link}>
      {props.children}
    </a>
  );
};

function findImageEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'IMAGE'
      );
    },
    callback
  );
}

const Image = (props) => {
  const {
    height,
    src,
    width,
  } = props.contentState.getEntity(props.entityKey).getData();

  return (
    <img src={src} height={height} width={width} />
  );
};

const decorator = new CompositeDecorator([{
    strategy: findLinkEntities,
    component: Link,
  }, {
    strategy: findImageEntities,
    component: Image,
  }]);


class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState> {

  constructor(props) {
    super(props);

    this.focus = () => (this.refs as any).editor.focus();
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.lastSelectionState = null;
    
    const contentState : ContentState = translate.htmlContentToDraft(this.props.content);

    this.state = {
      editorState: EditorState.createWithContent(contentState, decorator),
      inEdit: false
    };
    
    this.onChange = (editorState) => {
      
      
      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {

        const ss = editorState.getSelection();
        const changeType : SelectionChangeType = determineChangeType(this.lastSelectionState, ss);
        this.lastSelectionState = ss; 
        
        // Report any change, including initial change 
        if (changeType !== SelectionChangeType.None) {
          this.props.onSelectionChange(ss);
        }

        const content = editorState.getCurrentContent();
        const htmlContent : HtmlContent = translate.draftToHtmlContent(editorState.getCurrentContent());
        this.props.onEdit(htmlContent);

        return this.setState({editorState})
      }
    };
  }

  blockRenderer(block) {
    if (block.getType() === 'atomic') {
      return {
        component: ActivityFactory,
        editable: false,
        props: {
          onEditModeChange: (editMode) => {
            this.props.onEditModeChange(block.getKey(), editMode);
          },
          services: this.props.services,
          userId: this.props.userId
        }
      };
    }

    return null;
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  toggleInlineStyle(inlineStyle) {

    const updateStyle = RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle);

    const key : string = this.state.editorState.getSelection().getAnchorKey();
    const clearedSelection = EditorState.acceptSelection(updateStyle, SelectionState.createEmpty(key))

    this.onChange(clearedSelection);
  }

  componentWillReceiveProps(nextProps: DraftWrapperProps) {

    // Determine if we have received a new edit action
    if (this.props.editHistory.length !== nextProps.editHistory.length) {
      let action : any = nextProps.editHistory[0];
      if (action.type === 'TOGGLE_INLINE_STYLE') {
        this.toggleInlineStyle(action.style);
      } else if (action.type === 'INSERT_ACTIVITY') {
        this.insertActivity(action.activityType, action.data);
      }
    } 
  }

  insertActivity(type, data) {
      const {editorState} = this.state;
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        type,
        'IMMUTABLE',
        data
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(
        editorState,
        {currentContent: contentStateWithEntity}
      );

      this.onChange(AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          ' '
        ));
    }


  render() {
    return <div 
        style={styles.editor} 
        onClick={this.focus}>

        <Editor ref="editor"
          
          handleKeyCommand={this.handleKeyCommand}
          blockRenderMap={blockRenderMap}
          blockRendererFn={this.blockRenderer.bind(this)}
          editorState={this.state.editorState} 
          readOnly={this.state.inEdit || this.props.locked}
          onChange={this.onChange} />

      </div>;
  }

}

export default DraftWrapper;
