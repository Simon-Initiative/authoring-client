'use strict'

import * as React from "react";
import * as persistence from "../../../data/persistence";
import * as models from "../../../data/models";

import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from "../common/AbstractEditor";

interface CourseEditor {
}

export interface CourseEditorProps extends AbstractEditorProps<models.CourseModel> {

}


interface CourseEditorState extends AbstractEditorState {
   failure: boolean;
}

class CourseEditor extends AbstractEditor<models.CourseModel, CourseEditorProps, CourseEditorState> {

  constructor(props) {
    super(props, {failure: false});
  }

  registration(developers: string, action: string) {
    const courseId = this.props.model.guid;
    persistence.developerRegistration(courseId, [developers], action)
      .then(result => {
        let devs = this.props.model.developers;
        result.forEach(item => {
          console.log(JSON.stringify(item));
          const userName = item.userName;
          devs = devs.set(userName, item);
        });
        this.setState(
          {failure: false},
          () => this.props.onEdit(this.props.model.with({developers: devs})));
        console.log(JSON.stringify(this.props.model.developers));
      })
      .catch(err => {
        this.setState(
          {failure: true});
        console.log(err)});
  }

  renderResources() {

    // let link = (id, title) =>
    //   <button onClick={this.clickResource.bind(this, id)}
    //     className="btn btn-link">{title}</button>;

    // let rows = this.state.resources.map(r =>
    //   <tr key={r._id}>
    //       <td>{r.type}</td>
    //       <td>{link(r._id, r.title)}</td>
    //   </tr>)

    let developers = this.props.model.developers.toArray().map(d =>
      <div key={d.userName} className="row user">
        <div className="col-10">
          <span className="profile"></span>
          <span className="name">{d.firstName} {d.lastName}</span>
          <span className="inst">Carnegie Mellon University</span>
          <span className="email">{d.email}</span>
        </div>
        <div className="col-2">
          <button type="button" className={d.isDeveloper ?"btn btn-success":"btn btn-primary"}
                  onClick={(e) => this.registration(d.userName, d.isDeveloper ? "remove" : "add")}>{d.isDeveloper ? 'Remove' : 'Add'}</button>
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
                <div className="col-3">Thumbnail<br/><br/>
                  
                </div>
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
