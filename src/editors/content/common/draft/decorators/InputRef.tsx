import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';

import './InputRef.scss';

const InputRef = (props) => {
  const data = props.contentState.getEntity(props.entityKey).getData();

  const selected = props.activeItemId === data['@input'] ? 'input-ref-selected' : '';

  const onClick = (e) => {
    e.stopPropagation();
    props.onDecoratorClick(props.entityKey);
  };

  if (data.$type === 'FillInTheBlank') {
    return (
      <span
        onClick={onClick}
        className={`dropdownSpan ${selected}`}
        data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );
  }
  if (data.$type === 'Numeric') {
    return (
      <span
        onClick={onClick}
        className={`numericSpan ${selected}`}
        data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );

  }
  if (data.$type === 'Text') {
    return (
      <span
        onClick={onClick}
        className={`textSpan ${selected}`}
        data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );

  }

  return (
    <span
      onClick={onClick}
      className={`textSpan ${selected}`}
      data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

interface StateProps {
  activeItemId: string;
}

interface DispatchProps {

}

interface OwnProps {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeItemId: state.inputRef.valueOr(''),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

const ConnectedInputRef = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(InputRef);

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.input_ref),
    component: ConnectedInputRef,
    props,
  };
}
