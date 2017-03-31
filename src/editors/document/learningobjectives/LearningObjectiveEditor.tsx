import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';

import SortableTree from 'react-sortable-tree';
import { toggleExpandedForAll } from 'react-sortable-tree';
import NodeRendererDefault from 'react-sortable-tree';

//import OrganizationNodeRenderer from './OrganizationNodeRenderer';

const tempnavstyle=
{
    h2:
    {
        marginRight: '10px'
    }
};

interface LearningObjectiveEditor 
{

}

export interface LearningObjectiveEditorState extends AbstractEditorState 
{
    treeData : any;  
}

export interface LearningObjectiveEditorProps extends AbstractEditorProps<models.CourseModel>
{
  dispatch: any;
  documentId: string;
  userId: string;    
}

/**
*
*/
class LearningObjectiveEditor extends AbstractEditor<models.CourseModel,LearningObjectiveEditorProps, LearningObjectiveEditorState> 
{
    /**
     * 
     */
    constructor(props) {
        console.log ("LearningObjectiveEditor ()");
        
        super(props);
        this.state = {
                        treeData: [
                                    {
                                        title: 'Logic',
                                        children: [ 
                                                    { title: 'Pre Test' } 
                                                  ] 
                                    },
                                    {
                                        title: 'Sets',
                                        children: [ 
                                                    { title: 'Methods for Prevention' } 
                                                  ] 
                                    }    
                                ]
                    };            
    }
    
    componentDidMount() {
        console.log ("componentDidMount ()");
        this.fetchTitles(this.props.documentId);
    }    
    
    fetchTitles(documentId: types.DocumentId) {
        console.log ("fetchTitles ();");
        
        persistence.queryDocuments(titlesForCoursesResources(documentId)).then(docs => {
            /*
            this.setState(
            {
                resources: docs.map(d => ({ _id: d._id, title: (d as any).title.text, type: (d as any).modelType}))
            })
            */
        });
    }

    componentWillReceiveProps(nextProps) {
        console.log ("componentWillReceiveProps ();");
        
        if (this.props.documentId !== nextProps.documentId) 
        {
          this.fetchTitles(nextProps.documentId);
        }
    }    
    
    /**
     * 
     */
    processDataChange (treeData: any) {
        console.log ("processDataChange ()");
        
        this.setState(treeData)
        
        console.log (JSON.stringify(treeData));
    }

    expand(expanded) {
        this.setState({
            treeData: toggleExpandedForAll({
                treeData: this.state.treeData,
                expanded,
            }),
        });
    }

    expandAll() {
        this.expand(true);
    }

    collapseAll() {
        this.expand(false);
    }
                
    /**
     * 
     */
    render() {            
        return (
                <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2">
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <p className="h2" style={tempnavstyle.h2}>Course Content</p>
                        <button type="button" className="btn btn-secondary">Add Item</button>
                        <a className="nav-link" href="#" onClick={e => this.expandAll ()}>+ Expand All</a>
                        <a className="nav-link" href="#" onClick={e => this.collapseAll ()}>- Collapse All</a>
                    </nav>
                    <SortableTree
                        treeData={this.state.treeData}
                        generateNodeProps={rowInfo => ({
                          onClick: () => console.log(1),
                        })}
                        onChange={ treeData => this.processDataChange({treeData}) }
                        /*nodeContentRenderer={NodeRendererDefault}*/
                    />
                </div>
        );
    }
}

export default LearningObjectiveEditor;
