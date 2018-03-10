import { connect } from 'react-redux';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import ContiguousTextEditor from './ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { Maybe } from 'tsmonad';
import { TextSelection, ParentContainer } from 'types/active';

import * as activeActions from 'actions/active';

interface StateProps {

}

interface DispatchProps {
  onUpdateContentSelection: (
    documentId: string, content: Object,
    parent: ParentContainer, textSelection: Maybe<TextSelection>) => void;
}

interface OwnProps extends AbstractContentEditorProps<ContiguousText> {


}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onUpdateContentSelection: (
      documentId: string, content: Object,
      parent: ParentContainer, textSelection: Maybe<TextSelection>) => {

      return dispatch(activeActions.updateContext(documentId, content, parent, textSelection));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContiguousTextEditor);
