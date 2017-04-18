import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import '../common/editor.scss';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { UnsupportedEditor } from '../unsupported/UnsupportedEditor';
import { ResponseEditor } from './ResponseEditor';
import { HintEditor } from './HintEditor';


import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

type IdTypes = {
  correct: string,
  scoreOutOf: string,
  targets: string
}

export interface PartEditor {
  ids: IdTypes
}

export interface PartEditorProps extends AbstractContentEditorProps<contentTypes.Part> {

}

export interface PartEditorState {
  
  editHistory: Immutable.List<AuthoringActions>;
  correct: string;
  scoreOutOf: string;
  targets: string;
}

/**
 * The content editor for HtmlContent.
 */
export abstract class PartEditor 
  extends AbstractContentEditor<contentTypes.Part, PartEditorProps, PartEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: Immutable.List<AuthoringActions>(),
      correct: this.props.model.correct,
      scoreOutOf: this.props.model.scoreOutOf,
      targets: this.props.model.targets
    };

    this.ids = {
      scoreOutOf: guid(),
      correct: guid(),
      targets: guid()
    }

    this.onExplanationEdit = this.onExplanationEdit.bind(this);
    this.onResponseEdit = this.onResponseEdit.bind(this);
    this.onHintEdit = this.onHintEdit.bind(this);

    this.onAddHint = this.onAddHint.bind(this);
    this.onAddResponse = this.onAddResponse.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
  }

  onExplanationEdit(explanation) {
    const part = this.props.model.with({explanation});
    this.props.onEdit(part);
  }

  onResponseEdit(item) {
    this.props.onEdit(this.props.model.with({responses: this.props.model.responses.set(item.guid, item) }));
  }

  onHintEdit(item) {
    this.props.onEdit(this.props.model.with({hints: this.props.model.hints.set(item.guid, item) }));
  }

  onAddResponse() {
    let content = new contentTypes.Response();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.model.with({responses: this.props.model.responses.set(content.guid, content) }));
  
  }

  onAddHint() {
    let content = new contentTypes.Hint();
    content = content.with({guid: guid()});
    this.props.onEdit(this.props.model.with({hints: this.props.model.hints.set(content.guid, content) }));
  
  }

  renderResponses() {
    return this.props.model.responses.toArray().map(i => {
      return <ResponseEditor
              key={i.guid}
              documentId={this.props.documentId}
              courseId={this.props.courseId}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={i}
              onEdit={this.onResponseEdit} 
              editingAllowed={this.props.editingAllowed}/>
    });
  }

  renderHints() {
    return this.props.model.hints.toArray().map(i => {
      return <HintEditor
              key={i.guid}
              documentId={this.props.documentId}
              courseId={this.props.courseId}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              userId={this.props.userId}
              model={i}
              onEdit={this.onHintEdit} 
              editingAllowed={this.props.editingAllowed}/>
    });
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar 
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.documentId}
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA'
    }

    const style = {
      width: '80px'
    }

    return (
      <div className='itemWrapper'>
        <div>Part</div>

        <form className="form-inline">
           
           Correct&nbsp;&nbsp;
           <input style={style} className="form-control form-control-sm" type="text" value={this.state.correct} id={this.ids.correct}/>

           &nbsp;&nbsp;Score Out Of&nbsp;&nbsp;
           <input style={style} className="form-control form-control-sm" type="text" value={this.state.scoreOutOf} id={this.ids.scoreOutOf}/>

           &nbsp;&nbsp;Targets&nbsp;&nbsp;
           <input style={style} className="form-control form-control-sm" type="text" value={this.state.targets} id={this.ids.targets}/>
           &nbsp;&nbsp;
           <button onClick={this.onAddResponse} type="button" className="btn btn-sm btn-primary">Add Response</button>
           &nbsp;
           <button onClick={this.onAddHint} type="button" className="btn btn-sm btn-primary">Add Hint</button>
        </form>

        {this.renderResponses()}
        {this.renderHints()}

        <div>Explanation</div>
        <HtmlContentEditor 
              editorStyles={bodyStyle}
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              courseId={this.props.courseId}
              documentId={this.props.documentId}
              userId={this.props.userId}
              editHistory={this.state.editHistory}
              model={this.props.model.explanation}
              onEdit={this.onExplanationEdit} 
              editingAllowed={this.props.editingAllowed}
              />

      </div>);
  }

}

