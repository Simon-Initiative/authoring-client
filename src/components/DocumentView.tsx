import * as React from 'react';
import { UserProfile } from 'types/user';
import EditorManager from 'editors/manager/EditorManager.controller';
import { Toast, Severity } from 'components/common/Toast';
import './DocumentView.scss';
import { CourseModel } from 'data/models';
import { ResourceState } from 'data/content/resource';

export interface DocumentViewProps {
  onLoad: (documentId: string) => void;
  onRelease: (documentId: string) => void;
  documentId: string;
  profile: UserProfile;
  userId: string;
  userName: string;
  course: CourseModel;
  orgId: string;
}

function isDeletedResource(documentId, course: CourseModel): boolean {
  const resource = course.resources.get(documentId);
  if (resource !== undefined) {
    return resource.resourceState === ResourceState.DELETED;
  }
  // If it is missing, that doesnt mean it is deleted. In fact, it
  // likely means that it was just created by another user.
  return false;
}

export interface DocumentViewState { }

export default class DocumentView
  extends React.PureComponent<DocumentViewProps, DocumentViewState> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { onLoad, documentId } = this.props;
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

  renderDeleted() {

    const deletedIcon = <i className="fas fa-trash fa-1x fa-fw" />;
    const waitingHeading = 'Resource Deleted';
    const waitingContent = <p>It looks like this resource has been deleted.</p>;
    return (
      <div className="deleted-notification scale-in-center">
        <Toast
          style={{ width: 600 }}
          icon={deletedIcon}
          heading={waitingHeading}
          content={waitingContent}
          severity={Severity.Info} />
      </div>
    );

  }

  render() {
    const { course, documentId, profile, userId, userName, orgId } = this.props;

    if (isDeletedResource(documentId, course)) {
      return this.renderDeleted();
    }

    return (
      <div className="document-view">
        <EditorManager
          orgId={orgId}
          course={course}
          profile={profile}
          userId={userId}
          userName={userName}
          documentId={documentId} />
      </div>
    );
  }
}
