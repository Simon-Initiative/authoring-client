import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';

import styles from './SearchBar.style';

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onChange: (searchText: string) => void;
}

export interface SearchBarState {
  text: string;
}

/**
 * SearchBar React Component
 */
@injectSheet(styles)
export default class SearchBar
    extends React.PureComponent<StyledComponentProps<SearchBarProps>,
    SearchBarState> {

  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const text = e.target.value;
    this.setState({ text });
    this.props.onChange(text);
  }

  render() {
    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.searchBar, className])}>
        <span><i className="fa fa-search"/></span>
        <input
          placeholder={this.props.placeholder ? this.props.placeholder : 'Search'}
          type="text"
          className="form-control"
          value={this.state.text}
          onChange={this.onChange}/>
        </div>
    );
  }
}
