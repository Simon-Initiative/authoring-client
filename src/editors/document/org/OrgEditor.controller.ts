import { connect } from 'react-redux';
import { List } from 'immutable';
import OrgEditor from './OrgEditor';
import { getTitles, updateTitles } from 'actions/course';
import { Title } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';

interface StateProps {

}

interface DispatchProps {
  onUpdateTitle: (title: Title) => void;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onUpdateTitle: (title: Title) => {
      return dispatch(updateTitles([title]));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgEditor);
