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
import { TextInput } from '../../content/common/TextInput';
import Linkable from '../../../data/linkable';
import * as models from '../../../data/models';
import { Resource } from '../../../data/resource';
import * as contentTypes from '../../../data/contentTypes';
import guid from '../../../utils/guid';
import * as persistence from '../../../data/persistence';
import LearningObjectiveLinker from '../../../components/LinkerDialog';

interface AssessmentEditor {
  
}

export interface AssessmentEditorProps extends AbstractEditorProps<models.AssessmentModel> {
  
}

interface AssessmentEditorState extends AbstractEditorState {
  modalIsOpen : boolean;
  skillModel: models.SkillModel;
  current: string;
}

class AssessmentEditor extends AbstractEditor<models.AssessmentModel,
  AssessmentEditorProps, 
  AssessmentEditorState>  {

  constructor(props) {
    super(props, ({
      modalIsOpen: false, 
      skillModel: null,
      current: props.model.pages.first().guid,
    } as AssessmentEditorState));

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddContent = this.onAddContent.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
    this.onAddPool = this.onAddPool.bind(this);
    this.onAddPoolRef = this.onAddPoolRef.bind(this);
    this.onPageEdit = this.onPageEdit.bind(this);

    this.onAddPage = this.onAddPage.bind(this);
    this.onRemovePage = this.onRemovePage.bind(this);
    
  }

  componentDidMount() {                    
    let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
          
    resourceList.map((value, id) => {          
      if (value.type=="x-oli-skills_model") {
        persistence.retrieveDocument (this.props.context.courseId,id).then(skillDocument => {
          let sModel:models.SkillModel=skillDocument.model as models.SkillModel;
          //console.log ("Loaded skill model: " + JSON.stringify (sModel));  
          this.setState ({skillModel: sModel});                  
        });
      }          
    })
  }     
    
  /*
  loadSkills () : void {
            
    const resourceList:Immutable.OrderedMap<string, Resource>
     = this.props.courseDoc ['model']['resources'] as Immutable.OrderedMap<string, Resource>;
  
    resourceList.map((value, id) => {        
      if (value.type === 'x-oli-skills_model') {
        //console.log ('Found skills document, loading ...');  
        persistence.retrieveDocument (this.props.context.courseId,id)
        .then((skillDocument) => {
          console.log ('Loaded skill document, assigning ...');  
          const aSkillModel:models.SkillModel = skillDocument.model as models.SkillModel;   
          this.setState ({ skillModel: aSkillModel });
        });
      }          
    });
  } 
  */    
    
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
    page = page.with({ nodes: page.nodes.delete(guid) });

    const pages = this.props.model.pages.set(page.guid, page);

    this.handleEdit(this.props.model.with({ pages }));
  }

  renderNode(n : models.Node) {
    if (n.contentType === 'Question') {
      return <QuestionEditor
              key={n.guid}
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

  onAddQuestion() {
    let content = new contentTypes.Question();
    content = content.with({ guid: guid() });
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

  onRemovePage() {
    if (this.props.model.pages.size > 1) {

      const guid = this.state.current;

      let newCurrent = this.props.model.pages.first().guid;
      if (guid === newCurrent) {
        newCurrent = this.props.model.pages.last().guid;
      }

      this.setState(
        { current: newCurrent },
        () => {
          this.handleEdit(this.props.model.with(
            { pages: this.props.model.pages.delete(guid) }));
        });
    }
  }

  onAddPoolRef() {
    const pool = new contentTypes.Selection({ source: new contentTypes.PoolRef() });
    this.addNode(pool);
  }

  /**
   * 
   */
  closeModal (newAnnotations:any) {
    console.log ('closeModal ()');  
    
  }     

  /**
   * 
   */
  linkSkills (e:any) {        
    console.log ('linkSkills ()');
                 
    this.setState({ modalIsOpen: true });
  }

  /**
   * 
   */
  createLinkerDialog () {           
    if (this.state.skillModel) {            
      return (<LearningObjectiveLinker 
        title="Available Skills" 
        closeModal={this.closeModal.bind (this)} 
        sourceData={this.state.skillModel.skills} 
        modalIsOpen={this.state.modalIsOpen} 
        targetAnnotations={new Array<Linkable>()} />);
    } else {
      console.log ('Internal error: skill model object can be empty but not null');
    }
                   
    return (<div></div>);           
  }  

  render() {

    const titleEditor = this.renderTitle();
    const page = this.props.model.pages.get(this.state.current);
    const nodeEditors = page.nodes.toArray().map(n => this.renderNode(n));
    const skilllinker = this.createLinkerDialog ();    
    
    return (
      <div>
        <div className="docHead">
          <Toolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}
            onAddContent={this.onAddContent} onAddQuestion={this.onAddQuestion}/>
          
          <div className="container">
            <div className="row">
              <div className="col-4">
                {titleEditor}
              </div>
              <div className="col-8">
                <form className="form-inline">
                <PageSelection 
                  editMode={this.props.editMode}
                  pages={this.props.model.pages} 
                  current={this.props.model.pages.get(this.state.current)}
                  onChangeCurrent={current => this.setState({ current })}
                  onEdit={this.onPageEdit}/>
                <button disabled={!this.props.editMode} 
                  type="button" className="btn btn-secondary" 
                  onClick={this.onAddPage}>Add</button>
                <button disabled={!this.props.editMode} 
                  type="button" className="btn btn-secondary" 
                  onClick={this.onRemovePage}>Remove</button>
                </form>
              </div>
            </div>
          </div>

          <div>
            <button disabled={!this.props.editMode} 
              type="button" className="btn btn-secondary" 
              onClick={this.onAddContent}>Add Content</button>
            <button disabled={!this.props.editMode} 
              type="button" className="btn btn-secondary" 
              onClick={this.onAddQuestion}>Add Question</button>
            <button disabled={!this.props.editMode} 
              type="button" className="btn btn-secondary" 
              onClick={this.onAddPool}>Add Pool</button>
            <button disabled={!this.props.editMode} 
              type="button" className="btn btn-secondary" 
              onClick={this.onAddPoolRef}>Add Pool Reference</button>
            <button disabled={!this.props.editMode} 
              type="button" className="btn btn-secondary" 
              onClick={e => this.linkSkills (e)}>Add Skills</button>
          </div>
          
          
          {skilllinker} 

          <div className="componentWrapper">
            <form className="form-inline">
              <label>Recommended attempts</label>
              <TextInput
                editMode={this.props.editMode}
                width="50px"
                label=""
                type="number"
                value={this.props.model.recommendedAttempts}
                onEdit={
                  recommendedAttempts => this.handleEdit(
                    this.props.model.with({ recommendedAttempts }))}
              />&nbsp;&nbsp;&nbsp;&nbsp;
              <label>Max attempts</label>
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
            </form>
          </div>

          {nodeEditors}

        </div>
      </div>);
    
  }

}

export default AssessmentEditor;
