import * as React from 'react';
import { UserProfile } from 'types/user';
import EditorManager from 'editors/manager/EditorManager.controller';

export interface DocumentViewProps {
  onLoad: (documentId: string) => void;
  onRelease: (documentId: string) => void;
  documentId: string;
  profile: UserProfile;
  userId: string;
  userName: string;
  course: any;
}

export interface DocumentViewState {}

export default class DocumentView
  extends React.PureComponent<DocumentViewProps, DocumentViewState> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { onRelease, onLoad, documentId } = this.props;
    onLoad(documentId);
  }

  componentWillUnmount() {
    const { onRelease, documentId } = this.props;
    onRelease(documentId);
  }

  componentWillReceiveProps(nextProps: DocumentViewProps) {
    if (nextProps.documentId !== this.props.documentId) {
      const { onLoad, onRelease, documentId } = nextProps;

      onRelease(this.props.documentId);
      onLoad(documentId);
    }
  }

  render() {
    const { course, documentId, profile, userId, userName } = this.props;

    return (
      <div className="document-view container-fluid">
        <div className="row">
            <div className="col-sm-11 col-md-11 document">
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
