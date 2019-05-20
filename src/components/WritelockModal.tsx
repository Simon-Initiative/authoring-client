import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';

import { styles } from './WritelockModal.styles';

export interface WritelockModalProps {
  className?: string;
  courseId?: string;
  documentId?: string;
  onLoadDocument: (courseId, documentId) => Promise<any>;
}

export interface WritelockModalState {

}

/**
 * WritelockModal React Component
 */
class WritelockModal
  extends React.PureComponent<StyledComponentProps<WritelockModalProps, typeof styles>,
  WritelockModalState> {
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
        data-backdrop="static" className={classNames([classes.WritelockModal, 'modal'])}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              Session Expired
            </div>
            <div className="modal-body">
              <div>
                <span className="fa-stack fa-2x">
                  <i className="fas fa-lock fa-stack-1x"></i>
                  <i className="fa fa-ban fa-stack-2x" style={{ color: '#f39c12' }}></i>
                </span>
              </div>
              <div className={classNames([classes.messageText, 'flex-spacer'])}>
                <span>
                  This session has expired due to inactivity.
                  <br />
                  Refresh to continue editing
                </span>
              </div>
            </div>
            <div className="modal-footer">
              {courseId && documentId
                ? <button type="button" className="btn btn-primary"
                  onClick={e => onLoadDocument(courseId, documentId)}
                  data-dismiss="modal">Refresh</button>
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const StyledWritelockModal = withStyles<WritelockModalProps>(styles)(WritelockModal);
export { StyledWritelockModal as WritelockModal };
