import * as React from 'react';
import * as Immutable from 'immutable';
import guid from '../../utils/guid';

export interface DuplicateListingInput {
  id: string;
}

export interface DuplicateListingInputProps {
  editMode: boolean;
  buttonLabel: string;
  width: number;
  value: string;
  placeholder: string;
  existing: Immutable.List<string>;
  onClick: (string) => void;
}

export interface DuplicateListingInputState {
  value: string;
  duplicates: Immutable.List<string>;
}

export class DuplicateListingInput
  extends React.PureComponent<DuplicateListingInputProps, DuplicateListingInputState> {

  constructor(props) {
    super(props);

    this.id = guid();

    this.state = {
      value: this.props.value,
      duplicates: Immutable.List<string>(),
    };

    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  onChange(e) {
    const value = e.target.value;

    const duplicates = this.props.existing.filter(v => v.indexOf(value) !== -1).toList();
    this.setState({ value, duplicates });
  }

  renderDuplicates() {
    const duplicateDiv : any = {
      boxShadow: '10px 10px 5px #888888',
      background: 'none repeat scroll 0 0 #FFFFFF',
      opacity: 1,
      position: 'absolute',
      top: '30px',
      left: '0px',
      overflow: 'scroll',
      height: Math.min(400, (this.state.duplicates.size * 40) + 50),
      width: '100%',
      border: '1px solid gray',
      zIndex: 9999,
    };

    const duplicates = this.state.duplicates
      .map(d => <p>{d}</p>);

    return (
      <div style={duplicateDiv}>
        <p><b>These existing objectives look similar to the one you are creating:</b></p>
        {duplicates}
      </div>
    );
  }

  shouldRenderDuplicates() : boolean {
    return this.state.duplicates.size > 0 && this.state.value.length > 2;
  }

  render() {

    const duplicates = this.shouldRenderDuplicates() ? this.renderDuplicates() : null;

    const outerDiv : any = {
      position: 'relative',
      top: '0px',
      left: '0px',
    };

    return (
      <div style={outerDiv}>
        <form className="form-inline">
          <input
            disabled={!this.props.editMode}
            style={ { width: this.props.width } }
            placeholder={this.props.placeholder}
            onChange={this.onChange}
            className="form-control mb-2 mr-sm-2 mb-sm-0"
            type="string"
            value={this.state.value}
            id={this.id}/>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!this.props.editMode}
            onClick={() => this.props.onClick(this.state.value)}>
            {this.props.buttonLabel}
          </button>
        </form>
        {duplicates}
      </div>
    );
  }

}
