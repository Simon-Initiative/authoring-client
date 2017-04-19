'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import * as contentTypes from '../../../data/contentTypes';
import { TitleOracle } from '../../common/TitleOracle';
import './Concept.scss';

export interface Concept {
  
}

export interface ConceptProps {

  conceptId: string;

  conceptType: string;

  titleOracle: TitleOracle;

  onRemove: (id: string, type: string) => void;

}

export interface ConceptState {
  title: string;
}

/**
 * Concept
 */
export class Concept extends React.PureComponent<ConceptProps, ConceptState> {

  constructor(props) {
    super(props);

    this.state = {title: 'Waiting...'};

    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.props.titleOracle.getTitle(this.props.conceptId, this.props.conceptType)
      .then(title => this.setState({title}));
  }

  onClick() {
    this.props.onRemove(this.props.conceptId, this.props.conceptType);
  }

  render() : JSX.Element {
    return (
    <div className="chip">
      {this.state.title}
      <span className="closebtn" onClick={this.onClick}>&times;</span>
    </div>);
  }

}

