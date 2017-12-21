import { connect } from 'react-redux';

import WorkbookPageEditor from './WorkbookPageEditor';
import { fetchObjectives } from 'actions/objectives';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';
import { Resource } from 'data/contentTypes';
import { preview } from 'actions/preview';

interface StateProps {

}

interface DispatchProps {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    fetchObjectives: (courseId: string) => {
      return dispatch(fetchObjectives(courseId));
    },
    preview: (courseId: string, resource: Resource) => {
      return dispatch(preview(courseId, resource));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(WorkbookPageEditor);
