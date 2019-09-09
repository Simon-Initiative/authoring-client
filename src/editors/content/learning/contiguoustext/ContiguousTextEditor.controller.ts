import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import { Maybe } from 'tsmonad';
import ContiguousTextEditor from './ContiguousTextEditor';
import { insertParsedContent, updateEditor, selectInline } from 'actions/active';
import { ParsedContent } from 'data/parsers/common/types';
import { Inline } from 'slate';

interface StateProps {
  orderedIds: Immutable.Map<string, number>;
}

interface DispatchProps {
  onInsertParsedContent: (resourcePath: string, content: ParsedContent) => void;
  onUpdateEditor: (editor) => void;
  onSelectInline: (inline: Maybe<Inline>) => void;
}

interface OwnProps {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    orderedIds: state.orderedIds,
  };
};

const mapDispatchToProps = (dispatch, getState): DispatchProps => {

  return {
    onUpdateEditor: editor =>
      dispatch(updateEditor(editor)),
    onSelectInline: inline =>
      dispatch(selectInline(inline)),
    onInsertParsedContent: (
      resourcePath: string, content: ParsedContent) =>
      dispatch(insertParsedContent(resourcePath, content)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContiguousTextEditor);

export { controller as ContiguousTextEditor };
