import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import InlineToolbar  from './InlineToolbar';
import BlockToolbar  from './BlockToolbar';
import InlineInsertionToolbar from './InlineInsertionToolbar';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import * as persistence from '../../../data/persistence';
import { Resource } from '../../../data/content/resource';
import { Collapse } from '../../content/common/Collapse';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { ObjectiveSelection } from '../../../utils/selection/ObjectiveSelection';

import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { LegacyTypes } from '../../../data/types';

const styles = {  
  loContainer : {
    border: '1px solid grey',
    background: '#ffffff',  
    height: '125px',
    overflowX: 'auto',
    overflowY: 'scroll',
    marginBottom : '10px',
    padding : '4px',
  },
};

interface WorkbookPageEditor {
  
}

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  objectiveTitles: Immutable.List<string>;
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, 
  WorkbookPageEditorState> {
    
  constructor(props) {
    super(props, { objectiveTitles: Immutable.Map<string, string>() });

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onObjectivesEdit = this.onObjectivesEdit.bind(this);

    this.fetchObjectiveTitles(this.props.model.head.objrefs);
  }

  shouldComponentUpdate(nextProps: WorkbookPageEditorProps) : boolean {
    
    if (this.props.model !== nextProps.model) {
      return true;
    }
    if (this.props.editMode !== nextProps.editMode) {
      return true;
    }

    return false;
  }

  fetchObjectiveTitles(objrefs: Immutable.List<string>) {
    this.props.services.titleOracle.getTitles(
      this.props.context.courseId, 
      objrefs.toArray(),
      LegacyTypes.learning_objectives)

      .then((titles) => {
        this.setState({ objectiveTitles: Immutable.List<string>(titles) });
      });
  }

  onTitleEdit(title) {
    const head = this.props.model.head.with({ title });
    this.handleEdit(this.props.model.with({ head }));
  }

  onBodyEdit(content : any) {
    const model = this.props.model.with({ body: content });
    this.handleEdit(model);
  }

  onObjectivesEdit(objectives: Immutable.Set<contentTypes.LearningObjective>) {

    this.props.services.dismissModal();

    const head = this.props.model.head.with(
      { objrefs: objectives.map(o => o.id).toList() });
    this.handleEdit(this.props.model.with({ head }));
  }
    
  renderObjectives() {
    const objectives = this.state.objectiveTitles
      .toArray()
      .map((title) => {
        return <li key={title}>{title}</li>;
      });
    return (
      <ol>
        {objectives}
      </ol>
    );
  }

  componentWillReceiveProps(nextProps: WorkbookPageEditorProps) {

    const updateObjectiveTitles = () => {
      this.setState({ objectiveTitles: Immutable.List<string>() });

      if (nextProps.model.head.objrefs.size > 0) {
        this.fetchObjectiveTitles(nextProps.model.head.objrefs);
      }
    };
  

    if (nextProps.model !== this.props.model) {

      if (nextProps.model.head.objrefs.size !== this.props.model.head.objrefs.size) {
        updateObjectiveTitles();
      } else {
        for (let i = 0; i < nextProps.model.head.objrefs.size; i += 1) {
          if (nextProps.model.head.objrefs.get(i) !== this.props.model.head.objrefs.get(i)) {
            updateObjectiveTitles();
            break;
          }
        }
      }
      
    }
  }

  selectObjectives() {
    const component = <ObjectiveSelection 
      onInsert={this.onObjectivesEdit}
      onCancel={() => this.props.services.dismissModal()}
      courseId={this.props.context.courseId}
      titleOracle={this.props.services.titleOracle}/>;
      
    this.props.services.displayModal(component);
  }

  render() {      

    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;
    const insertionToolbar = <InlineInsertionToolbar/>;

    const addLearningObj = <button 
      className="btn btn-link" 
      onClick={() => this.selectObjectives()}>Edit Learning Objectives</button>;

    return (
      <div>
          <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
          <TitleContentEditor 
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.head.title}
            onEdit={this.onTitleEdit} 
            />
          
          <Collapse 
            caption="Learning Objectives" 
            expanded={addLearningObj}>

            {this.renderObjectives()}
          
          </Collapse>

          <HtmlContentEditor 
              inlineToolbar={inlineToolbar}
              inlineInsertionToolbar={insertionToolbar}
              blockToolbar={blockToolbar}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={this.props.model.body}
              onEdit={c => this.onBodyEdit(c)} 
              />
      </div>
    );
  }

}

export default WorkbookPageEditor;
