import { connect } from 'react-redux';
import { List } from 'immutable';
import WorkbookPageEditor from './WorkbookPageEditor';
import { getTitles } from 'app/actions/course';
import { Title } from 'app/types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'app/data/models';

interface StateProps {
  objectiveTitles: any;
}

interface DispatchProps {
  onGetTitles: (courseId: string, ids: string[], type: string) => any;
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
    onGetTitles: (courseId: string, ids: string[], type: string) => {
      return dispatch(getTitles(courseId, ids, type));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
