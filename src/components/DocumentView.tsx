import * as React from 'react';
import { bindActionCreators } from 'redux';
import { UserProfile } from 'types/user';
import EditorManager from 'editors/manager/EditorManager.controller';
import * as viewActions from 'actions/view';

export interface DocumentViewProps {
  dispatch: any;
  documentId: string;
  profile: UserProfile;
  userId: string;
  userName: string;
  course: any;
}

export interface DocumentViewState {}

export default class DocumentView
  extends React.PureComponent<DocumentViewProps, DocumentViewState> {
  viewActions: Object;

  constructor(props) {
    super(props);
    const { dispatch } = this.props;

    this.viewActions = bindActionCreators((viewActions as any), dispatch);
  }

  render() {
    const { course, documentId, profile, userId, userName } = this.props;

    return (
      <div className="document-view container-fluid">
        <div className="row">
            <div className="col-sm-12 col-md-12 document">
              <div className="editor">
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
    );
  }
}
