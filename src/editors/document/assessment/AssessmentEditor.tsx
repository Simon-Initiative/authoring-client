import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { SelectionEditor } from '../../content/selection/SelectionEditor';
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';
import { PageSelection } from './PageSelection';
import { Toolbar } from './Toolbar';
import { Select } from '../../content/common/Select';
import { TextInput } from '../../content/common/TextInput';
import * as models from '../../../data/models';
import { Resource } from '../../../data/content/resource';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import * as contentTypes from '../../../data/contentTypes';
import { LegacyTypes } from '../../../data/types';
import guid from '../../../utils/guid';
import * as persistence from '../../../data/persistence';
import { typeRestrictedByModel } from './utils';
import { Collapse } from '../../content/common/Collapse';
import { DraggableNode } from './DraggableNode';
import { RepositionTarget } from './RepositionTarget';
import { AddQuestion } from '../../content/question/AddQuestion';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface AssessmentEditor {
  
}

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  
}

interface AssessmentEditorState extends AbstractEditorState {
  current: string;
}

@DragDropContext(HTML5Backend)
class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps, 
  AssessmentEditorState>  {

  constructor(props) {
    super(props, ({
      current: props.model.pages.first().guid,
    } as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddPool = this.onAddPool.bind(this);
    this.onAddPoolRef = this.onAddPoolRef.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    this.onAddPage = this.onAddPage.bind(this);
    this.onRemovePage = this.onRemovePage.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onReorderNode = this.onReorderNode.bind(this);

    this.canHandleDrop = this.canHandleDrop.bind(this);
  }
        
  shouldComponentUpdate(
    nextProps: AssessmentEditorProps, 
    nextState: AssessmentEditorState) : boolean {

    if (this.props.model !== nextProps.model) {
      return true;
    }
    if (this.props.expanded !== nextProps.expanded) {
      return true;
    }
    if (this.props.editMode !== nextProps.editMode) {
      return true;
    }
    if (this.state.current !== nextState.current) {
      return true;
    }
    if (this.state.undoStackSize !== nextState.undoStackSize) {
      return true;
    }
    if (this.state.redoStackSize !== nextState.redoStackSize) {
      return true;
    }
    

    return false;
  }


  onPageEdit(page: contentTypes.Page) {
    const pages = this.props.model.pages.set(page.guid, page);
    this.handleEdit(this.props.model.with({ pages }));
  }

  onEdit(guid : string, content : models.Node) {
    this.addNode(content);
  }

  onTitleEdit(content: contentTypes.Title) {
    this.handleEdit(this.props.model.with({ title: content }));
  }

  onNodeRemove(guid: string) {

    let page = this.props.model.pages.get(this.state.current);

    const supportedNodes = page.nodes.toArray().filter(n => n.contentType !== 'Unsupported');

    if (supportedNodes.length > 1) {
      
      page = page.with({ nodes: page.nodes.delete(guid) });

      const pages = this.props.model.pages.set(page.guid, page);

      this.handleEdit(this.props.model.with({ pages }));
    }

  }

  renderNode(n : models.Node) {
    if (n.contentType === 'Question') {
      return <QuestionEditor
              key={n.guid}
              isParentAssessmentGraded={this.props.model.resource.type === LegacyTypes.assessment2}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              onRemove={this.onNodeRemove.bind(this)}
              />;
              
    } else if (n.contentType === 'Content') {
      return <ContentEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              onRemove={this.onNodeRemove.bind(this)}
              />;
    } else if (n.contentType === 'Selection') {
      return <SelectionEditor
              key={n.guid}
              isParentAssessmentGraded={this.props.model.resource.type === LegacyTypes.assessment2}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              onRemove={this.onNodeRemove.bind(this)}
              />;
    } else {
      /*
      return <UnsupportedEditor
              key={n.guid}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={n}
              onEdit={c => this.onEdit(n.guid, c)} 
              />; */
    }
  }

  renderTitle() {
    return <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.title}
            onEdit={this.onTitleEdit} 
            />;
  }

  onAddContent() {
    let content = new contentTypes.Content();
    content = content.with({ guid: guid() });
    this.addNode(content);
  }

  addQuestion(question: contentTypes.Question) {
    const content = question.with({ guid: guid() });
    this.addNode(content);
  }

  onAddPool() {
    const pool = new contentTypes.Selection({ source: new contentTypes.Pool() });
    this.addNode(pool);
  }

  addNode(node) {
    let page = this.props.model.pages.get(this.state.current);
    page = page.with({ nodes: page.nodes.set(node.guid, node) });

    const pages = this.props.model.pages.set(page.guid, page);

    this.handleEdit(this.props.model.with({ pages }));
  }

  onAddPage() {
    const text = 'Page ' + (this.props.model.pages.size + 1);
    const page = new contentTypes.Page()
      .with({ title: new contentTypes.Title().with({ text }) });
    
    this.handleEdit(this.props.model.with(
      { pages: this.props.model.pages.set(page.guid, page) }));
  }

  onRemovePage(page: contentTypes.Page) {

    if (this.props.model.pages.size > 1) {

      const guid = page.guid;
      const removed = this.props.model.with({ pages: this.props.model.pages.delete(guid) });

      if (guid === this.state.current) {
        this.setState(
          { current: removed.last().guid },
          () => this.handleEdit(removed));
      } else {
        this.handleEdit(removed);
      }
      
    }
  }

  onTypeChange(type) {
    const resource = this.props.model.resource.with({ type });
    const model = this.props.model.with({ resource });

    this.handleEdit(model);
  }

  onAddPoolRef() {
    const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef() });
    this.addNode(pool);
  }

  canHandleDrop(id) {
    const page = this.props.model.pages.get(this.state.current);
    return page.nodes.get(id) !== undefined;
  }

  renderDropTarget(index) {
    return <RepositionTarget index={index} 
      canAcceptId={this.canHandleDrop}  onDrop={this.onReorderNode}/>;
  }

  onReorderNode(id, index) {

    let page = this.props.model.pages.get(this.state.current);
    const arr = page.nodes.toArray();

    // find the index of the source node
    const sourceIndex = arr.findIndex(n => n.guid === id);

    if (sourceIndex !== -1) {

      let nodes = Immutable.OrderedMap<string, contentTypes.Node>();
      const moved = page.nodes.get(id);
      const indexToInsert = (sourceIndex < index) ? index - 1 : index;

      arr.forEach((n, i) => {

        if (i === index) {
          nodes = nodes.set(moved.guid, moved);
        }

        if (n.guid !== id) {
          nodes = nodes.set(n.guid, n);
        } 
      });

      if (index === arr.length) {
        nodes = nodes.set(moved.guid, moved);
      }

      page = page.with({ nodes });
      const pages = this.props.model.pages.set(page.guid, page);
      const model = this.props.model.with({ pages });

      this.handleEdit(model);
    }

  }

  renderNodes(page: contentTypes.Page) {
    const elements = [];
    const arr = page.nodes.toArray();
    arr.forEach((node, index) => {
      elements.push(this.renderDropTarget(index));
      elements.push(<DraggableNode id={node.guid} editMode={this.props.editMode} index={index}>
        {this.renderNode(node)}</DraggableNode>);
    });

    elements.push(this.renderDropTarget(arr.length));

    return elements;
  }


  renderSettings() {
    return (
      <Collapse caption="Settings">
        <div style={ { marginLeft: '25px' } }>
          <form>
            
            <div className="form-group row">
              <label className="col-3 col-form-label">Recommended attempts:</label>
              <TextInput
                editMode={this.props.editMode}
                width="50px"
                label=""
                type="number"
                value={this.props.model.recommendedAttempts}
                onEdit={
                  recommendedAttempts => this.handleEdit(
                    this.props.model.with({ recommendedAttempts }))}
              />
            </div>

            <div className="form-group row">
              <label className="col-3 col-form-label">Maximum attempts:</label>
              <TextInput
                editMode={this.props.editMode}
                width="50px"
                label=""
                type="number"
                value={this.props.model.maxAttempts}
                onEdit={
                  maxAttempts => this.handleEdit(
                    this.props.model.with({ maxAttempts }))}
              />
            </div>
          </form>
        </div>
      </Collapse>
    );
  }

  renderPagination() {

    const addButton = <button disabled={!this.props.editMode} 
      type="button" className="btn btn-secondary" 
      onClick={this.onAddPage}>Add Page</button>;


    return (
      
      <Collapse caption="Pagination" expanded={addButton}>

        <div style={ { marginLeft: '25px' } }>
          
          <PageSelection 
            onRemove={this.onRemovePage}
            editMode={this.props.editMode}
            pages={this.props.model.pages} 
            current={this.props.model.pages.get(this.state.current)}
            onChangeCurrent={current => this.setState({ current })}
            onEdit={this.onPageEdit}/>
          
        </div>
      </Collapse>
    
    );

  }

  renderAdd() {
    
    const isInline = this.props.model.resource.type === LegacyTypes.inline;

    const slash : any = {
      fontFamily: 'sans-serif',
      lineHeight: 1.25,
      position: 'relative',
      top: '-4',
      color: '#606060',
    };

    const label : any = {
      fontFamily: 'sans-serif',
      lineHeight: 1.25,
      fontSize: '13',
      position: 'relative',
      top: '-6',
      color: '#606060',
    };

    return (
      <div>

      <span style={label}>Insert new: </span> 
      
      <button disabled={!this.props.editMode} 
        type="button" className="btn btn-secondary btn-sm" 
        onClick={this.onAddContent}>Content</button>

      <span style={slash}>/</span>

      <AddQuestion 
        editMode={this.props.editMode}
        onQuestionAdd={this.addQuestion.bind(this)}
        isSummative={this.props.model.type === LegacyTypes.assessment2}/>

      <span style={slash}>/</span>
      
      <button 
        disabled={!this.props.editMode || isInline} 
        type="button" className="btn btn-secondary btn-sm" 
        onClick={this.onAddPool}>Pool</button>

        <span style={slash}>/</span>

      <button 
        disabled={!this.props.editMode || isInline} 
        type="button" className="btn btn-secondary btn-sm" 
        onClick={this.onAddPoolRef}>Pool Reference</button>

      </div>
    );
  }

  render() {

    const titleEditor = this.renderTitle();
    const page = this.props.model.pages.get(this.state.current);
    const nodeEditors = this.renderNodes(page);

    return (
      <div>
        <div className="docHead">

          <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
          
          {titleEditor}

          <div style={ { marginTop: '20px' } }/>

          <div className="componentWrapper content">
            {this.props.model.type === LegacyTypes.assessment2
              ? this.renderSettings() : null}
            {this.renderPagination()}         
          </div>

          <div style={ { marginTop: '40px' } }/>

          {this.renderAdd()}
          
          {nodeEditors}

        </div>
      </div>);
    
  }

}

export default AssessmentEditor;

