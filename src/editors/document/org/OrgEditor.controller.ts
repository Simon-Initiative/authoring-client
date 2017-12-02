import { connect } from 'react-redux';
import { List } from 'immutable';
import OrgEditor from './OrgEditor';
import { loadCourse } from 'actions/course';
import { Title } from 'types/course';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { WorkbookPageModel } from 'data/models';

interface StateProps {

}

interface DispatchProps {

}

interface OwnProps extends AbstractEditorProps<WorkbookPageModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(OrgEditor);
