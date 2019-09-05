import * as React from 'react';
import { InputRefType, InputRef } from 'data/content/learning/input_ref';
import './styles.scss';
import { connect } from 'react-redux';
import { Maybe } from 'tsmonad';
import { setActiveItemIdActionAction } from 'actions/inputRef';

interface InputRefProps {
  setActiveItemIdActionAction: (inputId: string) => void;
  inputRef: InputRef;
  onClick: () => void;
  activeInputId: Maybe<string>;
}

interface InputRefState {

}

class InputRefDisplay extends React.PureComponent<InputRefProps, InputRefState> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {

    const { onClick, inputRef, activeInputId,
      setActiveItemIdActionAction } = this.props;
    const { inputType, input } = inputRef;

    const handleClick = () => {
      setActiveItemIdActionAction(input);
      onClick();
    };

    const active = activeInputId.caseOf({
      just: id => id === input ? 'oli-active-input' : 'oli-input',
      nothing: () => 'oli-input',
    });

    if (inputType === InputRefType.Numeric) {
      return <input className={active} onClick={handleClick} readOnly value="Numeric" size={15} />;
    }
    if (inputType === InputRefType.Text) {
      return <input className={active} onClick={handleClick} readOnly value="Text" size={15} />;
    }
    if (inputType === InputRefType.FillInTheBlank) {
      return <select className={active} onClick={handleClick} size={15} />;
    }
    return <input className={active} onClick={handleClick} readOnly value="Text" size={15} />;
  }
}


interface StateProps {
  activeInputId: Maybe<string>;
}

interface DispatchProps {
  setActiveItemIdActionAction: (activeItemId: string) => void;
}

interface OwnProps {
  inputRef: InputRef;
  onClick: () => void;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    activeInputId: state.inputRef,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    setActiveItemIdActionAction: (activeItemId: string) =>
      dispatch(setActiveItemIdActionAction(activeItemId)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(InputRefDisplay);

export { controller as InputRefDisplay };
