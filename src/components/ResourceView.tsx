'use strict'

import * as React from "react";
import {returnType} from "../utils/types";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {CourseResource, fetchCourseResources} from "../editors/document/common/resources";
import NavigationBar from "./NavigationBar";
import * as persistence from "../data/persistence";
import * as models from "../data/models";
import * as viewActions from "../actions/view";

interface ResourceView {
    viewActions: any;
}

export interface ResourceViewOwnProps {
    courseId: string;
    dispatch: any;
    title: string;
    filterFn: (resource: CourseResource) => boolean;
    createResourceFn: (title: string, courseId: string) => models.ContentModel;
}


interface ResourceViewState {
    resources: CourseResource[];
}

function mapStateToProps(state: any) {

    const {
        course
    } = state;

    return {
        course
    }
}

const stateGeneric = returnType(mapStateToProps);
type ResourceViewReduxProps = typeof stateGeneric;
type ResourceViewProps = ResourceViewReduxProps & ResourceViewOwnProps & { dispatch };

class ResourceView extends React.Component<ResourceViewProps, ResourceViewState> {

    constructor(props) {
        super(props);

        this.state = {
            resources: []
        };

        this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
    }

    componentDidMount() {
        // Fetch the titles of all current course resources
        console.log("ResourceView componentDidMount");
        if(this.props.course){
            console.log("ResourceView componentDidMount 2");
            this.fetchTitles(this.props.course.model, this.props.filterFn);
        }

    }

    fetchTitles(model : models.CourseModel, filterFn: any) {
        this.setState({resources: model.resources.filter(filterFn)});
    }

    // fetchTitles(id: string) {
    //     this.setState({resources: this.props.course.model.resources.filter(this.props.filterFn)});
    //     // fetchCourseResources(id)
    //     //     .then(resources => {
    //     //         this.setState({resources: resources.filter(this.props.filterFn)});
    //     //     });
    // }

    componentWillReceiveProps(nextProps) {
        console.log("ResourceView componentWillReceiveProps");
        if((typeof nextProps.course !== 'undefined') && nextProps.course){
            console.log("ResourceView componentWillReceiveProps 2");
            this.fetchTitles(nextProps.course.model, nextProps.filterFn);
        }
        // if (this.props.courseId !== nextProps.courseId || this.props.title !== nextProps.title) {
        //     this.fetchTitles(nextProps.courseId);
        // }
    }

    clickResource(id) {
        this.props.dispatch(viewActions.viewDocument(id));
    }

    createResource(e) {

        e.preventDefault();

        const title = (this.refs['title'] as any).value;
        const resource = this.props.createResourceFn(title, this.props.courseId);

        // persistence.createDocument(resource)
        //     .then(result => this.fetchTitles(this.props.courseId));
    }

    renderResources() {

        let link = (id, title) =>
            <button onClick={this.clickResource.bind(this, id)}
                    className="btn btn-link">{title}</button>;

        let rows = this.state.resources.map(r =>
            <tr key={r.guid}>
                <td>{link(r.guid, r.title)}</td>
            </tr>)

        return (
            <div className="">
                <h2>{this.props.title}</h2>
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>Title</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>);
    }

    renderCreation() {
        return (
            <div className="input-group col-12">
                <form className="form-inline">
                    <input type="text" ref='title' className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
                           placeholder="Title"></input>
                    <button onClick={this.createResource.bind(this)} className="btn btn-primary">Create</button>
                </form>
            </div>);
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <NavigationBar viewActions={this.viewActions}/>
                    <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2 document">
                        <div className="container-fluid editor">
                            <div className="row">
                                <div className="col-12">
                                    {this.renderCreation()}
                                    {this.renderResources()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
export default connect<ResourceViewReduxProps, {}, ResourceViewrOwnProps>(mapStateToProps)(ResourceView);
