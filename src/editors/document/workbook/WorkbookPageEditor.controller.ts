import { connect } from 'react-redux';
import { List } from 'immutable';
import WorkbookPageEditor from './WorkbookPageEditor';
import { getTitles, updateTitles } from 'actions/course';
import { Title } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';

interface StateProps {
  objectiveTitles: any;
}

interface DispatchProps {
  onGetTitles: (courseId: string, ids: string[], type: string) => any;
  onUpdateTitle: (titles: Title[]) => void;
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
    onUpdateTitle: (titles: Title[]) => {
      return dispatch(updateTitles(titles));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
