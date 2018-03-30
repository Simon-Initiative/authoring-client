import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import BlockQuoteToolbar from './BlockQuoteToolbar';
import { BlockQuote } from 'data/content/learning/blockquote';

interface StateProps {
  selection: TextSelection;
}

interface DispatchProps {

}

interface OwnProps extends AbstractContentEditorProps<BlockQuote> {

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
  (mapStateToProps, mapDispatchToProps)(BlockQuoteToolbar);
