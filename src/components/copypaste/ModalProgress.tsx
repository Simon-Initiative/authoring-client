import * as React from 'react';
import * as Immutable from 'immutable';
import { ParsedContent } from 'data/parsers/common/types';
import { resolveDependencies, ResolverProgress } from 'data/parsers/resolvers';
import { applyResolutions } from 'data/parsers/apply';
import { ContentElement } from 'data/content/common/interfaces';

export interface ModalProgressProps {
  parsedContent: ParsedContent;
  courseId: string;
  resourcePath: string;
  onComplete: (elements: Immutable.List<ContentElement>) => void;
}

export interface ModalProgressState {
  countComplete: number;
}

export class ModalProgress extends React.Component<ModalProgressProps, ModalProgressState> {

  modal: any;

  constructor(props) {
    super(props);

    this.state = { countComplete: 0 };
  }

  componentDidMount() {
    (window as any).$(this.modal).modal('show');

    // Wait one second to begin the import.  This guarantees that
    // the user sees this dialog for an adquate minimum time in the
    // event that the resolutions are extremely quick.
    setTimeout(() => this.beginImport(), 1000);
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  beginImport() {

    const { parsedContent, courseId, resourcePath } = this.props;

    const callback = (progress: ResolverProgress) => {
      this.setState({ countComplete: this.state.countComplete + 1 });
    };

    resolveDependencies(parsedContent.dependencies, courseId, resourcePath, callback)
      .then((resolutions) => {
        const elements = applyResolutions(resolutions, parsedContent.elements);
        setTimeout(() => this.props.onComplete(elements), 1000);
      });
  }

  renderProgressBar(complete, total) {

    const percentage = complete / total;
    const style : any = { width: ((percentage * 100) + '%') };

    return (
      <div className="progress">
        <div className="progress-bar progress-bar-striped"
          role="progressbar"
          style={style}
          aria-valuenow={complete} aria-valuemin="0" aria-valuemax={total}></div>
      </div>
    );
  }

  renderMessage(complete, total) {

    if (complete === total) {
      return 'Import complete!';
    }

    if (total === 1) {
      return 'Importing one image';
    }

    return 'Importing ' + (complete + 1) + ' of ' + total + ' images';
  }

  render() {

    const total = this.props.parsedContent.dependencies.size;
    const complete = this.state.countComplete;

    return (
      <div ref={(modal) => { this.modal = modal; }}
      data-backdrop="static" className="modal fade">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              {this.renderMessage(complete, total)}
            </div>
            <div className="modal-body">
              {this.renderProgressBar(complete, total)}
            </div>
          </div>
        </div>
      </div>
    );

  }

}
