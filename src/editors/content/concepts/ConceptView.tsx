'use strict';

import * as React from 'react';
import * as Immutable from 'immutable';

import * as contentTypes from 'app/data/contentTypes';
import { Title } from 'app/types/course';
import './Concept.scss';

export interface ConceptProps {
  editMode: boolean;
  conceptId: string;
  conceptType: string;
  courseId: string;
  onGetTitle: (courseId: string, conceptId: string, conceptType: string) => Promise<Title>;
  onRemove: (id: string, type: string) => void;
}

export interface ConceptState {
  title: string;
}

export default interface Concept {}

/**
 * Concept React Component
 */
export default class Concept extends React.PureComponent<ConceptProps, ConceptState> {

  constructor(props) {
    super(props);

    this.state = { title: 'Waiting...' };

    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.props.onGetTitle(this.props.courseId, this.props.conceptId, this.props.conceptType)
      .then((t: Title) => {
        this.setState({
          title: t.title,
        });
      });
  }

  onClick() {
    if (this.props.editMode) {
      this.props.onRemove(this.props.conceptId, this.props.conceptType);
    }
  }

  render() : JSX.Element {
    return (
    <div className="chip">
      {this.state.title}
      <span className="closebtn" onClick={this.onClick}>&times;</span>
    </div>);
  }
}

