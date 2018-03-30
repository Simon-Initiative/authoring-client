import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextToolbar from './ContiguousTextToolbar';
import { ContiguousText } from 'data/content/learning/contiguous';

interface StateProps {
  selection: TextSelection;
}

interface DispatchProps {

}

interface OwnProps extends AbstractContentEditorProps<ContiguousText> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;

  return {
    selection: activeContext.textSelection.caseOf({ just: s => s, nothing: () => {
      return TextSelection.createEmpty('');
    },
    }),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContiguousTextToolbar);
