import * as React from 'react';
import { OrganizationModel, CourseModel } from 'data/models';
import { CourseId } from 'data/types';
import { DeleteResourceModal } from 'components/DeleteResourceModal.controller';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

export interface Actions {

}

export interface ActionsProps {
  onDuplicate: () => void;
  onPreview: (courseId: CourseId, organization: OrganizationModel) => Promise<any>;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  org: OrganizationModel;
  course: CourseModel;
}

export interface ActionsState {
  isPublishing: boolean;
  failedPublish: boolean;
}

export class Actions
  extends React.PureComponent<ActionsProps, ActionsState> {

  constructor(props) {
    super(props);

    this.state = {
      isPublishing: false,
      failedPublish: false,
    };

    this.publish = this.publish.bind(this);
  }

  publish() {
    const { onPreview, course, org } = this.props;

    this.setState({
      isPublishing: true,
    });

    onPreview(course.guid, org)
      .then(_ => this.setState({ isPublishing: false }))
      .catch((err) => {
        this.setState({ isPublishing: false, failedPublish: true });
        console.log('Preview publish error:', err);
      });
  }

  render() {
    const { course, org, onDisplayModal, onDismissModal, onDuplicate }
      = this.props;

    const { isPublishing, failedPublish } = this.state;

    const failedPublishButton = <button
      disabled
      className="btn btn-block btn-primary"
      onClick={() => { }}>
      Failed to publish
    </button>;

    const isPublishingButton = <button
      disabled
      className="btn btn-block btn-primary"
      onClick={() => { }}>
      <LoadingSpinner className="u-no-padding" message="Publishing" />
    </button>;

    const publishButton = <button
      className="btn btn-block btn-primary"
      onClick={this.publish}>
      Publish
    </button>;

    return (
      <div className="org-tab">

        <dl className="row">

          <dd className="col-sm-10"><strong>Publish</strong> the complete course package
          using this organization to the OLI development server. This may take awhile.</dd>
          <dt className="col-sm-2 justify-content-right">
            {failedPublish
              ? failedPublishButton
              : isPublishing
                ? isPublishingButton
                : publishButton}
          </dt>

          <br /><br />

          <dd className="col-sm-10">Create a <strong>copy</strong> of this organization.
          Changes you make to the structure
            of the copy (e.g. adding units, removing modules,
          renaming sections) will not be reflected in this original organization.</dd>
          <dt className="col-sm-2 justify-content-right">
            <button
              onClick={onDuplicate}
              className="btn btn-block btn-primary">
              Copy
            </button>
          </dt>
          <dd className="col-sm-10">
            <p>Permanently <strong>delete</strong> this organization from the course package. This
          operation cannot be undone.</p>
          </dd>
          <dt className="col-sm-2">
            <button
              disabled={false}
              className="btn btn-block btn-danger"
              onClick={() => onDisplayModal(
                <DeleteResourceModal
                  resource={org.resource}
                  course={course}
                  onDismissModal={onDismissModal} />)}>
              Delete
            </button>
          </dt>

        </dl>

      </div>
    );
  }

}

