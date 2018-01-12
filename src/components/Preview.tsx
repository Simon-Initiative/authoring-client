import * as React from 'react';
import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as Messages from 'types/messages';

export interface PreviewProps {
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

function buildMessage() {
  const content = new Messages.TitledContent().with({
    title: 'Refresh in progress.',
    message: 'A newer version of this page is loading, please wait.',
  });
  return new Messages.Message().with({
    content,
    guid: 'PreviewMessage',
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Information,
    canUserDismiss: false,
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

  renderWait() {
    return (
      <div className="jumbotron">
        <h4>One moment while we set up the preview...</h4>
        <p className="lead"></p>
        <hr className="my-4"/>
        <p>
          This page will auto-refresh and display your preview
          when it is ready.
        </p>
        <p>Depending on how many changes have been made
          to the course package since the last preview,
          this may take several minutes.
        </p>

      </div>
    );
  }

  checkOnProgress() {

    this.timerId = Maybe.nothing();

    const { courseId, documentId } = this.props;

    persistence.initiatePreview(courseId, documentId, true)
      .then((result) => {
        if (result.type === 'PreviewSuccess') {
          if (result.message === '') {
            this.props.dismissMessage(buildMessage());
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

    if (needsRefresh) {
      this.props.showMessage(buildMessage());
      this.checkOnProgress();
    }
  }

  componentWillUnmount() {
    this.timerId.lift(id => window.clearTimeout(id));
  }

  render() {

    const buildIFrame = url => <iframe height="100%" width="100%" src={url} />;


    const iframeOrWait = this.props.previewUrl.caseOf({
      just: url => buildIFrame(url),
      nothing: () => this.state.previewUrl.caseOf({
        just: url => buildIFrame(url),
        nothing: () => this.renderWait(),
      }),
    });

    return (
      <div className="preview">
        {iframeOrWait}
      </div>
    );
  }

}
