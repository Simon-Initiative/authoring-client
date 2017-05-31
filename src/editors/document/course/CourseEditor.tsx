'use strict'

import * as React from "react";
import * as persistence from "../../../data/persistence";
//import {CourseResource} from "../common/resources";
import * as models from "../../../data/models";
import * as courseActions from '../../../actions/course';

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from "../common/AbstractEditor";
import {Resource} from "../../../data/resource";

interface CourseEditor {
    _registration: (developers: string, action: string) => any;
}

export interface CourseEditorProps extends AbstractEditorProps<models.CourseModel> {

}


interface CourseEditorState extends AbstractEditorState {
    resources: Resource[];
}

class CourseEditor extends AbstractEditor<models.CourseModel, CourseEditorProps, CourseEditorState> {

    constructor(props) {
        super(props, {resources: []});
        this._registration = this.registration.bind(this);
    }

    registration(developers: string, action: string) {
        const courseId = this.props.model.guid;
        persistence.developerRegistration(courseId, [developers], action)
          .then(result => this.refreshCoursePackage(courseId))
          .catch(err => console.log(err));
      }

     refreshCoursePackage(courseId: string) {
        persistence.retrieveCoursePackage(courseId)
          .then((document) => {
            // Get an updated course content package payload
            // if (document.model.modelType === models.ModelTypes.CourseModel) {
            //   this.props.dispatch(courseActions.courseChanged(document.model));
            // }
          })
          .catch(err => console.log(err));
      }
    // registerUser(courseId: string, userNames: string[], action: string) {
    //     console.log("registerUser (" + courseId + ")");
    //     persistence.developerRegistration(courseId, userNames, action)
    //       .then(document => {
    //         // Notify that the course has changed when a user views a course
    //         if (document.model.modelType === models.ModelTypes.CourseModel) {
    //           this.props.dispatch(courseActions.courseChanged(document.model));
    //           this.props.dispatch(viewActions.viewDocument(courseId));
    //         }

    //       })
    //       .catch(err => console.log(err));
    // }

    componentDidMount() {
        // Fetch the titles of all current course resources
        // this.fetchTitles(this.props.context.documentId);
    }

    // fetchTitles(id: string) {
    //   fetchCourseResources(id)
    //     .then(resources => this.setState({resources}));
    // }

    // componentWillReceiveProps(nextProps) {
    //   if (this.props.context.documentId !== nextProps.context.documentId) {
    //     this.fetchTitles(nextProps.documentId);
    //   }
    // }

    // clickResource(id) {
    //   this.props.services.viewDocument(id);
    // }
    //
    // createResource(e) {
    //
    //   e.preventDefault();
    //
    //   const type = (this.refs['type'] as any).value;
    //   const title = (this.refs['title'] as any).value;
    //
    //   let resource = null;
    //   if (type === 'workbook') {
    //     resource = new models.WorkbookPageModel({
    //         courseId: this.props.context.documentId,
    //         head: new contentTypes.Head({ title: new contentTypes.Title({ text: title}) })
    //       });
    //   } else {
    //     resource = new models.AssessmentModel({
    //         courseId: this.props.context.documentId,
    //         title: new contentTypes.Title({ text: title})
    //       });
    //   }
    //
    //   persistence.createDocument(resource)
    //     .then(result => this.fetchTitles(this.props.context.documentId));
    // }

    renderResources() {

        // let link = (id, title) =>
        //   <button onClick={this.clickResource.bind(this, id)}
        //     className="btn btn-link">{title}</button>;

        // let rows = this.state.resources.map(r =>
        //   <tr key={r._id}>
        //       <td>{r.type}</td>
        //       <td>{link(r._id, r.title)}</td>
        //   </tr>)
        let developers = this.props.model.developers.map(d =>
            <div className="row user">
                <div className="col-10">
                    <span className="profile"></span>
                    <span className="name">{d.firstName} {d.lastName}</span>
                    <span className="inst">Carnegie Mellon University</span>
                    <span className="email">{d.email}</span>
                </div>
                <div className="col-2">
                    <button type="button" className="btn btn-success" onClick={this._registration(d.userName, "remove")}>Remove</button>
                </div>
            </div>
            )
        return (
            <div className="row users">
                    <div className="col-md-9">
                        <h2>Team Members</h2>
                        <div className="userContain">
                            {developers}
                        </div>
                    </div>
                </div>);
    }

    renderWebContent() {

        // let link = (id, title) =>
        //   <button onClick={this.clickResource.bind(this, id)}
        //     className="btn btn-link">{title}</button>;

        // let rows = this.state.resources.map(r =>
        //   <tr key={r._id}>
        //       <td>{r.type}</td>
        //       <td>{link(r._id, r.title)}</td>
        //   </tr>)
        let rows = this.props.model.webContents.map(r =>
            <tr key={r.guid}>
                <td>{JSON.stringify(r)}</td>
            </tr>)
        return (
            <div className="row">
                <h2>All WebContent</h2>
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>Files</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>);
    }

    // renderCreation() {
    //     return (
    //         <div className="input-group col-9">
    //             <form className="form-inline">
    //                 <select ref="type" className="custom-select mb-2 mr-sm-2 mb-sm-0" id="inlineFormCustomSelect">
    //                     <option value="workbook">Workbook</option>
    //                     <option value="assessment">Assessment</option>
    //                 </select>
    //                 <input type="text" ref='title' className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
    //                        placeholder="Title"></input>
    //                 <button onClick={this.createResource.bind(this)} className="btn btn-secondary">Create</button>
    //             </form>
    //         </div>);
    // }

    render() {
        // return (
        //     <div>
        //         { /* <div className="col-1"></div> */}
        //
        //         {this.renderResources()}
        //         {/*{this.renderCreation()}*/}
        //
        //         { /* <div className="col-1"></div> */}
        //     </div>
        // )
        let model = this.props.model;
        return (
            <div className="admin">
                <div className="row info">
                    <div className="col-md-9">
                        <h2>Content Package</h2>
                        <div className="infoContain">
                        <div className="row">
                            <div className="col-3">Title</div>
                            <div className="col-9">{model.title}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">Description</div>
                            <div className="col-9">{model.description}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">Id</div>
                            <div className="col-9">{model.id}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">Version</div>
                            <div className="col-9">{model.version}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">Type</div>
                            <div className="col-9">{model.type}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">Thumbnail<br/><br/><button type="button" className="btn btn-primary">Upload</button></div>
                            <div className="col-9">
                                <img src="assets/ph-courseView.png" className="img-fluid" alt=""></img>

                            </div>
                        </div>
                        </div>
                    </div>

                </div>
                <br/><br/>
                {this.renderResources()}
                {/*<div className="row users">
                    <div className="col-md-9">
                        <h2>Team Members</h2>
                        <div className="userContain">
                            <div className="row user">
                                <div className="col-10">
                                    <span className="profile"></span>
                                    <span className="name">Nick Leaf</span>
                                    <span className="inst">Carnegie Mellon University</span>
                                    <span className="email">example@email.com</span>
                                </div>
                                <div className="col-2">
                                    <button type="button" className="btn btn-secondary">Add</button>
                                </div>
                            </div>
                            <div className="row user">
                                <div className="col-10">
                                    <span className="profile"></span>
                                    <span className="name">Nick Leaf</span>
                                    <span className="inst">Carnegie Mellon University</span>
                                    <span className="email">example@email.com</span>
                                </div>
                                <div className="col-2">
                                    <button type="button" className="btn btn-success">Remove</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>*/}
                {/* 
                <div className="row">
                    <div className="col-md-9">
                        <p>Metadata: {JSON.stringify(model.metadata)}</p>
                        <p>Icon: {JSON.stringify(model.icon)}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-9">
                        <p>Options: {model.options}</p>
                    </div>
                </div>
                <div className="row team">
                    <div className="col-md-9">
                        <h2>Team Members</h2>
                        <p>Options: {model.options}</p>
                    </div>
                </div>
                */}  
                {/* 
                {this.renderResources()}
                {this.renderWebContent()}
                */}  
            </div>
        );
    }

}

export default CourseEditor;
