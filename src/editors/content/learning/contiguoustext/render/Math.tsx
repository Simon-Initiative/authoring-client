import * as React from 'react';
import { Math as MathRenderer } from 'utils/math/Math';
import './styles.scss';
import { connect } from 'react-redux';
import { InlineDisplayProps } from './common';

interface MathProps extends InlineDisplayProps {
  isSelected: boolean;
}

interface MathState {

}

class MathDisplay extends React.PureComponent<MathProps, MathState> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {

    const { onClick, node, attrs, isSelected } = this.props;
    const math = node.data.get('value');

    return (
      <MathRenderer
        isSelected={isSelected}
        attrs={attrs}
        onClick={onClick}
        inline>{math.data}</MathRenderer>
    );
  }
}


interface StateProps {
  isSelected: boolean;
}

interface DispatchProps {

}

interface OwnProps extends InlineDisplayProps {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    isSelected: state.activeContext.activeInline.key === ownProps.node.key,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(MathDisplay);

export { controller as MathDisplay };
