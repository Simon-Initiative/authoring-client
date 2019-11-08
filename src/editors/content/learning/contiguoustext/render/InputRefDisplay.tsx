import * as React from 'react';
import { InputRefType } from 'data/content/learning/input_ref';
import './styles.scss';
import { connect } from 'react-redux';
import { Maybe } from 'tsmonad';
import { setActiveItemIdActionAction } from 'actions/inputRef';
import { InlineDisplayProps } from './common';

interface InputRefProps extends InlineDisplayProps {
  setActiveItemIdActionAction: (inputId: string) => void;
  activeInputId: Maybe<string>;
}

interface InputRefState {

}

class InputRefDisplay extends React.PureComponent<InputRefProps, InputRefState> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {

    const { onClick, node, activeInputId, attrs,
      setActiveItemIdActionAction } = this.props;
    const { inputType, input } = node.data.get('value');

    const handleClick = (e) => {
      setActiveItemIdActionAction(input);
      onClick(e);
    };

    const active = activeInputId.caseOf({
      just: id => id === input ? 'oli-active-input' : 'oli-input',
      nothing: () => 'oli-input',
    });

    if (inputType === InputRefType.Numeric) {
      return <input {...attrs} className={active}
        onClick={handleClick} readOnly value="Numeric" size={15} />;
    }
    if (inputType === InputRefType.Text) {
      return <input {...attrs} className={active}
        onClick={handleClick} readOnly value="Text" size={15} />;
    }
    if (inputType === InputRefType.FillInTheBlank) {
      return <input {...attrs} className={active}
        onClick={handleClick} readonly
        style={{ width: '100px', border: '1px', textAlign: 'center' }}
        placeholder="Dropdown" />;
    }
    return <input {...attrs} className={active}
      onClick={handleClick} readOnly value="Text" size={15} />;
  }
}


interface StateProps {
  activeInputId: Maybe<string>;
}

interface DispatchProps {
  setActiveItemIdActionAction: (activeItemId: string) => void;
}

interface OwnProps extends InlineDisplayProps {

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
