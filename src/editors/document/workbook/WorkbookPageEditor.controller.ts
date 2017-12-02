import { connect } from 'react-redux';
import { List } from 'immutable';
import WorkbookPageEditor from './WorkbookPageEditor';
import { fetchObjectives } from 'actions/objectives';
import { Title } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';

interface StateProps {

}

interface DispatchProps {
  fetchObjectives: (courseId: string) => void;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const { objrefs } = ownProps.model.head;
  return {
    objectiveTitles: objrefs.map(id => state.titles.get(id)),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    fetchObjectives: (courseId: string) => {
      return dispatch(fetchObjectives(courseId));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
