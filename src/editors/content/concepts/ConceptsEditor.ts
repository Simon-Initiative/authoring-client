import { connect } from 'react-redux';
import { List } from 'immutable';
import ConceptsEditorView from './ConceptsEditorView';
import { fetchSkillTitles } from 'app/actions/course';
import {
  AbstractContentEditorProps,
} from 'app/editors/content/common/AbstractContentEditor';

interface StateProps {}

interface DispatchProps {
  onFetchSkillTitles: (courseId: string, conceptId: string, conceptType: string) => any;
}

interface OwnProps extends AbstractContentEditorProps<List<string>> {
  conceptType: string;
  courseId: string;
  title: string;
}

const mapStateToProps = (state): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onFetchSkillTitles: (courseId: string) => {
      dispatch(fetchSkillTitles(courseId));
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ConceptsEditorView);
