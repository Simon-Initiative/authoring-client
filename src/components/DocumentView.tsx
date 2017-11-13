import * as React from 'react';
import { bindActionCreators } from 'redux';
import NavigationBar from './navigation/NavigationBar.controller';
import { UserProfile } from 'types/user';
import EditorManager from 'editors/manager/EditorManager.controller';
import { AppServices, DispatchBasedServices } from 'editors/common/AppServices';
import { LegacyTypes } from 'data/types';
import * as viewActions from 'actions/view';
import { getTitlesByModel } from 'actions/course';
import { Title } from 'types/course';

export interface DocumentViewProps {
  dispatch: any;
  documentId: string;
  profile: UserProfile;
  userId: string;
  userName: string;
  course: any;
}

export interface DocumentViewState {}

export default interface DocumentView {
  viewActions: Object;
}

export default class DocumentView
  extends React.PureComponent<DocumentViewProps, DocumentViewState> {
  constructor(props) {
    super(props);
    const { dispatch } = this.props;

    this.viewActions = bindActionCreators((viewActions as any), dispatch);
  }

  componentDidMount() {
    const { course, dispatch } = this.props;

    dispatch(getTitlesByModel(course.model));
  }

  render() {
    const { course, documentId, profile, userId, userName } = this.props;

    return (
      <div className="container-fluid">
        <div className="row">
            <NavigationBar viewActions={this.viewActions} />
            <div className="col-sm-9 col-md-10 document">
              <div className="container-fluid editor">
                <div className="row">
                  <div className="col-12">
                    <EditorManager
                      course={course}
                      profile={profile}
                      userId={userId}
                      userName={userName}
                      documentId={documentId} />
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}
