import * as React from 'react';
import './ModalMinimal.scss';

export interface ModalMinimal {
  modal: any;
}

export interface ModalMinimalProps {

}

export class ModalMinimal extends React.PureComponent<ModalMinimalProps, {}> {

  componentDidMount() {
    (window as any).$(this.modal).modal('show');
  }

  componentWillUnmount() {
    (window as any).$(this.modal).modal('hide');
  }

  render() {
    return (
      <div ref={(modal) => { this.modal = modal; }}
        data-backdrop="true" className="modal-minimal modal fade">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-body">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
