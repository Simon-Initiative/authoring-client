import * as React from 'react';
import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';

export interface PreviewProps {
  documentId?: string;
  courseId?: string;
  previewUrl: Maybe<string>;
}

interface PreviewState {
  previewUrl: Maybe<string>;
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
        <h4>Setting up the preview</h4>
        <p className="lead">One moment while we set up the preview of this course resource.</p>
        <hr className="my-4"/>
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

    persistence.initiatePreview(courseId, documentId)
      .then((result) => {
        if (result.type === 'PreviewSuccess') {
          this.setState({ previewUrl: Maybe.just(result.activityUrl || result.sectionUrl) });
        } else if (result.type === 'PreviewPending') {
          this.timerId = Maybe.just(window.setTimeout(() => this.checkOnProgress(), 10000));
        }
      });
  }

  componentDidMount() {
    this.props.previewUrl.caseOf({
      nothing: () => this.checkOnProgress(),
      just: url => true,
    });
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
