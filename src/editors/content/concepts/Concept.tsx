'use strict';

import * as React from 'react';
import * as Immutable from 'immutable';

import * as contentTypes from 'data/contentTypes';
import { Title } from 'types/course';
import './Concept.scss';

export interface ConceptProps {
  title: string;
  editMode: boolean;
  conceptId: string;
  conceptType: string;
  courseId: string;
  onGetTitle: (courseId: string, conceptId: string, conceptType: string) => Promise<Title>;
  onRemove: (id: string, type: string) => void;
}

export interface ConceptState {}

export default interface Concept {}

/**
 * Concept React Component
 */
export default class Concept extends React.PureComponent<ConceptProps, ConceptState> {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const { courseId, conceptId, conceptType, onGetTitle } = this.props;

    onGetTitle(courseId, conceptId, conceptType);
  }

  onClick() {
    const { editMode, conceptId, conceptType, onRemove } = this.props;

    if (editMode) {
      onRemove(conceptId, conceptType);
    }
  }

  render() : JSX.Element {
    const { title } = this.props;

    return (
    <div className="chip">
      {title || 'Waiting...'}
      <span className="closebtn" onClick={this.onClick}>&times;</span>
    </div>);
  }
}
