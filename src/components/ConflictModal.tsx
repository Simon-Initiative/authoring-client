import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';

import { styles } from './ConflictModal.styles';

export interface ConflictModalProps {
  className?: string;
  courseId: string;
  documentId: string;
  onLoadDocument: (courseId, documentId) => Promise<any>;
}

export interface ConflictModalState {

}

/**
 * ConflictModal React Component
 */
class ConflictModal
  extends React.PureComponent<StyledComponentProps<ConflictModalProps, typeof styles>,
  ConflictModalState> {
  modal: any;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  render() {
    const { classes, courseId, documentId, onLoadDocument } = this.props;

    return (
      <div ref={(modal) => { this.modal = modal; }}
        data-backdrop="static" className={classNames([classes.ConflictModal, 'modal'])}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              External Conflict
            </div>
            <div className="modal-body">
              <div>
                <span className="fa-stack fa-2x">
                  <i className="fa fa-exclamation fa-stack-1x"></i>
                  <i className="far fa-file fa-stack-2x"></i>
                </span>
              </div>
              <div className={classNames([classes.messageText, 'flex-spacer'])}>
                <span>
                  This content has been modified by an external source and must be updated.
                  <br />
                  <br />
                  Refresh to continue editing
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary"
                onClick={e => onLoadDocument(courseId, documentId)}
                data-dismiss="modal">Refresh</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const StyledConflictModal = withStyles<ConflictModalProps>(styles)(ConflictModal);
export { StyledConflictModal as ConflictModal };
