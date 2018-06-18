import * as React from 'react';
import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as Messages from 'types/messages';

import './Preview.scss';

export interface PreviewProps {
  email: string;
  documentId?: string;
  courseId?: string;
  previewUrl: Maybe<string>;
  shouldRefresh: boolean;
  showMessage: (m: Messages.Message) => void;
  dismissMessage: (m: Messages.Message) => void;
}

interface PreviewState {
  previewUrl: Maybe<string>;
}

function buildPreviewMessage() {
  const content = new Messages.TitledContent().with({
    title: 'Refresh in progress.',
    message: 'A newer version of this page is loading, please wait.',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewInProgressMessage',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Warning,
    canUserDismiss: false,
    actions: Immutable.List([]),
  });
}

function buildAccountMessage(email: string) {
  const content = new Messages.TitledContent().with({
    title: 'Preview',
    message: 'To preview your content, sign in to your Preview (dev-01.oli.cmu.edu) '
      + 'account. If you have never signed in to your Preview '
      + 'account, please check your ' + email
      + ' email for instructions.',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewAccountMessage',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Information,
    canUserDismiss: true,
    actions: Immutable.List([]),
  });
}



export default class Preview extends React.PureComponent<PreviewProps, PreviewState> {

  timerId: Maybe<number>;

  constructor(props) {
    super(props);

    this.state = { previewUrl: Maybe.nothing() };

    this.timerId = Maybe.nothing();
  }

  checkOnProgress() {

    this.timerId = Maybe.nothing();

    const { courseId, documentId } = this.props;

    persistence.initiatePreview(courseId, documentId, true)
      .then((result) => {
        if (result.type === 'PreviewSuccess') {
          if (result.message === '') {
            this.props.dismissMessage(buildPreviewMessage());
            this.setState({ previewUrl: Maybe.just(result.activityUrl || result.sectionUrl) });
          } else {
            this.timerId = Maybe.just(window.setTimeout(() => this.checkOnProgress(), 10000));
          }
        } else if (result.type === 'PreviewPending') {
          this.timerId = Maybe.just(window.setTimeout(() => this.checkOnProgress(), 10000));
        }
      });
  }

  componentDidMount() {
    // Poll for a refresh if we don't have the preview URL yet
    // or if we have it but the page is stale should be refreshed
    const needsRefresh = this.props.previewUrl.caseOf({
      nothing: () => true,
      just: url => this.props.shouldRefresh,
    });

    this.props.showMessage(buildAccountMessage(this.props.email));

    if (needsRefresh) {
      this.props.showMessage(buildPreviewMessage());
      this.checkOnProgress();
    }
  }

  componentWillUnmount() {
    this.timerId.lift(id => window.clearTimeout(id));
  }

  render() {

    const buildIFrame = (url) => {
      return <iframe className="preview-iframe" src={url} />;
    };

    const needsRefresh = this.props.previewUrl.caseOf({
      nothing: () => true,
      just: url => this.props.shouldRefresh,
    });

    const iframe = this.props.previewUrl.caseOf({
      just: url => buildIFrame(url),
      nothing: () => this.state.previewUrl.caseOf({
        just: url => buildIFrame(url),
        nothing: () => null,
      }),
    });

    const iframeOrWait = needsRefresh
      && this.state.previewUrl.caseOf({ just: n => false, nothing: () => true })
      ? <div className="preview-waiting">
          Please wait while the course content is being built.
        </div>
      : iframe;

    return (
      <div className="preview">
        {iframeOrWait}
      </div>
    );
  }

}
