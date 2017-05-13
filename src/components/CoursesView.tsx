import * as React from "react";

import * as persistence from "../data/persistence";
import * as viewActions from "../actions/view";

import * as models from "../data/models";
import * as courseActions from "../actions/course";

interface CoursesView {
    onSelect: (id) => void;
    _createCourse: () => void;
}

type CourseDescription = {
    guid: string,
    id: string,
    version: string,
    title: string,
    description: string
}

export interface CoursesViewProps {
    userId: string;
    dispatch: any;
}

class CoursesView extends React.PureComponent<CoursesViewProps, { courses: CourseDescription[] }> {

    constructor(props) {
        super(props);

        this.state = {courses: []};
        this._createCourse = this.createCourse.bind(this);
        //this.onSelect = this.fetchDocument.bind(this);
        this.onSelect = (id) => {
            this.fetchDocument(id);
        }
    }

    createCourse() {
        console.log("createCourse called");
        this.props.dispatch(viewActions.viewCreateCourse());
    }

    componentDidMount() {

        persistence.getEditablePackages()
        //.then(docs => {
        //   const courseIds = docs.map(result => (result as any).courseId);
        //   //return persistence.queryDocuments(titlesForCoursesQuery(courseIds))
        // })
            .then(docs => {
                //let courses : CourseDescription[] = docs.map(d => ({ id: d.id, title: (d as any).title['#text']}));
                let courses: CourseDescription[] = docs.map(d => ({
                    guid: d.guid,
                    id: d.id,
                    version: d.version,
                    title: d.title,
                    description: d.description
                }));
                this.setState({courses});
            })
            .catch(err => {
                console.log(err);
            });

        // persistence.queryDocuments(coursesQuery(this.props.userId))
        //   .then(docs => {
        //     const courseIds = docs.map(result => (result as any).courseId);
        //     return persistence.queryDocuments(titlesForCoursesQuery(courseIds))
        //   })
        //   .then(docs => {
        //     let courses : CourseDescription[] = docs.map(d => ({ id: d._id, title: (d as any).title['#text']}));
        //     this.setState({ courses });
        //   })
        //   .catch(err => {
        //     console.log(err);
        //   });onClick={this.onSelect(guid)}
    }

    fetchDocument(documentId: string) {
        console.log("fetchDocument (" + documentId + ")");
        persistence.retrieveDocument(documentId)
            .then(document => {
                // Notify that the course has changed when a user views a course
                if (document.model.modelType === models.ModelTypes.CourseModel) {
                    this.props.dispatch(courseActions.courseChanged(document.model));
                    this.props.dispatch(viewActions.viewDocument(documentId));
                }

            })
            .catch(err => console.log(err));
    }
    
    render() {

        let rows = this.state.courses.map((c, i) => {
            const {guid, id, version, title, description} = c;
            return <div className="course" key={guid}>
                <img src="assets/ph-courseView.png" className="img-fluid" alt=""/>
                <div className="content container">
                    <div className="row">
                        <div className="information col-3">
                            <span className="title">{id + '_' + version}</span>
                        </div>
                        <div className="information col-3">
                            <span className="title">{title}</span>
                            <span className="name">Instructor Name</span>
                        </div>
                        <div className="description col-7">
                            {description}
                            {/*C@CM is a three-unit, pass/fail half-semester mini course that will help you develop the foundational computing and information literacy skills that you will need to succeed in your other courses. It is a graduation requirement for...*/}
                        </div>
                        <div className="enter col-2">
                            <button type="button" className="btn btn-primary" key={guid}
                                    onClick={this.onSelect.bind(this, guid)}>
                                Enter Course
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        });

        return (
            <div>
                <div className="createCourse">
                    <div className="container">
                        <div className="row">
                            <div className="col-6 offset-1">
                                <p className="lead">
                                    OLI’s aim is to combine free, high-quality courses, continuous feedback, and
                                    research to improve learning and transform higher education. If you’re
                                    ready to check out OLI for yourself, let’s get started.
                                </p>
                            </div>
                            <div className="col-4">
                                <button onClick={this._createCourse}
                                        className="btn btn-secondary btn-lg btn-block outline serif">
                                    <img src="assets/icon-book.png" width="42" height="42"
                                         className="d-inline-block align-middle" alt=""/>
                                    Create Course Package
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container courseView editor">
                    <h2>Course Packages</h2>
                    {rows}
                </div>
            </div>
        );
    }
}

export default CoursesView;


