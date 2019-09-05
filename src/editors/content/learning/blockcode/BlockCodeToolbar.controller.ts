import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import BlockCodeToolbar from './BlockCodeToolbar';
import { BlockCode } from 'data/content/learning/blockcode';
import { Maybe } from 'tsmonad';
import { Editor } from 'slate';

interface StateProps {
  editor: Maybe<Editor>;
  selection: TextSelection;
}

interface DispatchProps {

}

interface OwnProps extends AbstractContentEditorProps<BlockCode> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;

  return {
    editor: activeContext.editor,
    selection: activeContext.editor.caseOf({
      just: s => new TextSelection(s.value.selection),
      nothing: () => TextSelection.createEmpty(''),
    }),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(BlockCodeToolbar);
