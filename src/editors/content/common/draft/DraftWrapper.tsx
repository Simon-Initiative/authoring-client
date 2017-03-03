'use strict'

import * as React from 'react';
import {Editor, EditorState, CompositeDecorator, ContentState, 
  ContentBlock, convertFromRaw, convertToRaw, AtomicBlockUtils, RichUtils} from 'draft-js';

import * as translate from './translate';

import { HtmlContent } from '../../../../data/contentTypes';

import { getActivityByName, Activity } from '../../../../activity/registry';

interface DraftWrapper {
  onChange: any;
  focus: () => any; 
  handleKeyCommand: any;
  
}

export interface DraftWrapperProps {
  editHistory: Object[];
  onEdit: (HtmlContent) => void;
  content: HtmlContent;
  locked: boolean;
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

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
  {
    strategy: findImageEntities,
    component: Image,
  },
]);


class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState> {

  constructor(props) {
    super(props);

    this.focus = () => (this.refs as any).editor.focus();
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    
    const contentState : ContentState = translate.htmlContentToDraft(this.props.content);

    this.state = {
      editorState: EditorState.createWithContent(contentState, decorator),
      inEdit: false
    };
    
    this.onChange = (editorState) => {

      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {

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
          onEditMode: (editMode) => {
            this.setState({inEdit: editMode})
          }
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
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  componentWillReceiveProps(nextProps: DraftWrapperProps) {

    const contentState : ContentState = translate.htmlContentToDraft(nextProps.content);

    this.setState({
      editorState: EditorState.createWithContent(contentState, decorator)
    });

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
    return <div style={styles.editor} onClick={this.focus}>
        <Editor ref="editor"
          handleKeyCommand={this.handleKeyCommand}
          blockRendererFn={this.blockRenderer.bind(this)}
          editorState={this.state.editorState} 
          readOnly={this.state.inEdit || this.props.locked}
          onChange={this.onChange} />
      </div>;
  }

}

export default DraftWrapper;
