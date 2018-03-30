import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import BlockFormulaToolbar from './BlockFormulaToolbar';
import { BlockFormula } from 'data/content/learning/blockformula';

interface StateProps {
  selection: TextSelection;
}

interface DispatchProps {

}

interface OwnProps extends AbstractContentEditorProps<BlockFormula> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;

  return {
    selection: activeContext.textSelection.caseOf({
      just: s => s,
      nothing: () => TextSelection.createEmpty(''),
    }),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(BlockFormulaToolbar);
