import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { DynaDragDropEditor } from './DynaDragDropEditor';
import { AssessmentModel } from 'data/models';
import { Page, Node, Question } from 'data/contentTypes';
import { save } from 'actions/document';
import { selectInitiator } from 'actions/dynadragdrop';
import { AbstractContentEditorProps } from '../../common/AbstractContentEditor';
import { Custom } from 'data/content/assessment/custom';

interface StateProps {
  documentId: string;
  assessment: AssessmentModel;
  currentPage: Page;
  currentNode: Node | any;
  selectedInitiator: string;
}

interface DispatchProps {
  onSaveAssessment: (documentId: string, updatedAssessment: AssessmentModel) => void;
  onSelectInitiator: (id: string) => void;
}

interface OwnProps extends AbstractContentEditorProps<Custom> {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    documentId: state.documents.first().documentId,
    assessment: (state.documents.first().document.model as AssessmentModel),
    currentPage: state.documents.first().currentPage.caseOf({
      just: cp => (state.documents.first().document.model as AssessmentModel).pages.get(cp),
      nothing: () => undefined,
    }),
    currentNode: state.documents.first().currentNode.valueOr(undefined) as Question,
    selectedInitiator: state.dynadragdrop.selectedInitiator,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onSaveAssessment: (documentId: string, updatedAssessment: AssessmentModel) => {
      dispatch(save(documentId, updatedAssessment));
    },
    onSelectInitiator: (id: string) => {
      dispatch(selectInitiator(id));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(DynaDragDropEditor);

export { controller as DynaDragDropEditor };
