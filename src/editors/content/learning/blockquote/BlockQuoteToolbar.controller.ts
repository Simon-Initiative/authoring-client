import { connect } from 'react-redux';
import { TextSelection } from 'types/active';
import {
  AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import BlockQuoteToolbar from './BlockQuoteToolbar';
import { BlockQuote } from 'data/content/learning/blockquote';
import { Maybe } from 'tsmonad';
import { Editor, Inline } from 'slate';

interface StateProps {
  selection: TextSelection;
  editor: Maybe<Editor>;
  activeInline: Maybe<Inline>;
}

interface DispatchProps {

}

interface OwnProps extends AbstractContentEditorProps<BlockQuote> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const { activeContext } = state;

  return {
    editor: activeContext.editor,
    activeInline: activeContext.activeInline,
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
  (mapStateToProps, mapDispatchToProps)(BlockQuoteToolbar);
