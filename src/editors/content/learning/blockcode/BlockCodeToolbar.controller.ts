import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import BlockCodeToolbar from './BlockCodeToolbar';
import { BlockCode } from 'data/content/learning/blockcode';

interface StateProps {
  selection: TextSelection;
}

interface DispatchProps {

}

interface OwnProps extends AbstractContentEditorProps<BlockCode> {

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
  (mapStateToProps, mapDispatchToProps)(BlockCodeToolbar);
