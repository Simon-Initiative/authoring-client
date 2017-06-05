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
import Linkable from '../../../data/linkable';
import * as models from '../../../data/models';
import { Resource } from '../../../data/resource';
import * as contentTypes from '../../../data/contentTypes';
import { LegacyTypes } from '../../../data/types';
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
    this.onTypeChange = this.onTypeChange.bind(this);
  }

  componentDidMount() {                    

    /*  
    let resourceList:Immutable.OrderedMap<string, Resource>=this.props.courseDoc ["model"]["resources"] as Immutable.OrderedMap<string, Resource>;
          
    resourceList.map((value, id) => {          
      if (value.type=="x-oli-skills_model") {
        persistence.retrieveDocument (this.props.context.courseId,id).then(skillDocument => {
          let sModel:models.SkillModel=skillDocument.model as models.SkillModel;  
          this.setState ({skillModel: sModel});                  
        });
      }          
    })
    */
      
    this.props.context.courseModel.resources.map((value, id) => {        
      if (value.type === 'x-oli-skills_model') {
        console.log ('Found skills document, loading ...');  
        persistence.retrieveDocument (this.props.context.courseId,id)
        .then((skillDocument) => {
          console.log ('Loaded skill document, assinging ...');  
          const aSkillModel:models.SkillModel = skillDocument.model as models.SkillModel;   
          this.setState ({ skillModel: aSkillModel.with (this.state.skillModel) });
        });
      }          
    });      
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

  onTypeChange(type) {
    const resource = this.props.model.resource.with({ type });
    const model = this.props.model.with({ resource });

    this.handleEdit(model);
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
    
    //this.handleEdit(this.props.model.with({ annotations: newAnnotations }));      
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
    if (!this.state.skillModel){
      return (<LearningObjectiveLinker 
        title="Available Skills" 
        errorMessage="No skills available. Did you create a skills document?"
        closeModal={this.closeModal.bind (this)} 
        sourceData={[]} 
        modalIsOpen={this.state.modalIsOpen} 
        targetAnnotations={new Array<Linkable>()} />);         
    }

    return (<LearningObjectiveLinker 
      title="Available Skills" 
      closeModal={this.closeModal.bind (this)} 
      sourceData={this.state.skillModel.skills} 
      modalIsOpen={this.state.modalIsOpen} 
      targetAnnotations={new Array<Linkable>()} />);           
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
              <div className="col-8">
                {titleEditor}
              </div>
              <div className="col-4">
                <Select
                  value={this.props.model.resource.type}
                  label="Type:"
                  editMode={this.props.editMode}
                  onChange={this.onTypeChange}
                >
                  <option value={LegacyTypes.assessment2}>Graded</option>
                  <option value={LegacyTypes.inline}>Not Graded</option>
                  
                </Select>
              </div>
            </div>
            <div className="row">
              
              <div className="col">
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
