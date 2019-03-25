import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { withStyles } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from '../../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { Page, Question, Part, Choice, Response,
  FillInTheBlank } from 'data/contentTypes';
import { AssessmentModel } from 'data/models';
import guid from 'utils/guid';
import { Maybe } from 'tsmonad';
import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';
import { Feedback } from 'data/content/assessment/feedback';
import {
  setQuestionPartWithInitiatorScore,
} from 'editors/content/learning/dynadragdrop/utils';
import { HTMLTableEditor } from './HTMLTableEditor';
import { styles } from './DynaDragDropEditor.styles';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import {
  TableTargetArea,
} from 'data/content/assessment/dragdrop/htmlLayout/table/table_targetarea';

export interface DynaDragDropEditorProps extends AbstractContentEditorProps<Custom> {
  documentId: string;
  assessment: AssessmentModel;
  currentPage: Page;
  currentNode: Question;
  selectedInitiator: string;
  onSaveAssessment: (documentId: string, updatedAssessment: AssessmentModel) => void;
  onSelectInitiator: (id: string) => void;
}

export interface DynaDragDropEditorState {

}

class DynaDragDropEditor
  extends AbstractContentEditor<Custom,
    StyledComponentProps<DynaDragDropEditorProps, typeof styles>, DynaDragDropEditorState> {

  constructor(props) {
    super(props);

    this.assignInitiator = this.assignInitiator.bind(this);
    this.unassignInitiator = this.unassignInitiator.bind(this);
    this.selectInitiator = this.selectInitiator.bind(this);
    this.addInitiator = this.addInitiator.bind(this);
    this.deleteInitiator = this.deleteInitiator.bind(this);
    this.onTargetDrop = this.onTargetDrop.bind(this);
    this.onEditQuestion = this.onEditQuestion.bind(this);
    this.onEditLayoutData = this.onEditLayoutData.bind(this);
  }

  shouldComponentUpdate(nextProps: DynaDragDropEditorProps, nextState) {
    return this.props.model !== nextProps.model
      || this.props.parent !== nextProps.parent
      || this.props.editMode !== nextProps.editMode
      || this.props.activeContentGuid !== nextProps.activeContentGuid
      || this.props.hover !== nextProps.hover
      || this.props.documentId !== nextProps.documentId
      || this.props.assessment !== nextProps.assessment
      || this.props.currentPage !== nextProps.currentPage
      || this.props.currentNode !== nextProps.currentNode
      || this.props.selectedInitiator !== nextProps.selectedInitiator;
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Custom} columns={4}>
      </ToolbarGroup>
    );
  }

  assignInitiator(initiatorId: string, targetAssessmentId: string) {
    const { model, currentNode } = this.props;

    const updatedQuestion = setQuestionPartWithInitiatorScore(
      initiatorId, targetAssessmentId, 1, model, currentNode);

    this.onEditQuestion(updatedQuestion);
  }

  unassignInitiator(initiatorId: string, targetAssessmentId: string) {
    const { model, currentNode } = this.props;

    const updatedQuestion = setQuestionPartWithInitiatorScore(
      initiatorId, targetAssessmentId, 0, model, currentNode);

    this.onEditQuestion(updatedQuestion);
  }

  selectInitiator(id: string) {
    const { onSelectInitiator } = this.props;

    onSelectInitiator(id);
  }

  addInitiator() {
    const { model, currentNode } = this.props;
    const question = currentNode;

    const newInitiator = new InitiatorModel().with({
      text: 'New Choice',
      inputVal: guid(),
    });

    let targetAssessmentIds = [];
    if (question.items.first()) {
      targetAssessmentIds = (question.items.first() as FillInTheBlank).choices
        .toArray().map(c => c.value);
    }

    const newItem = new FillInTheBlank().with({
      id: newInitiator.inputVal,
      choices: Immutable.OrderedMap<string, Choice>([
        ...targetAssessmentIds.map((t) => {
          const choice = new Choice().with({
            value: t,
            body: new ContentElements().with({ supportedElements: Immutable.List(FLOW_ELEMENTS) }),
          });
          return [choice.guid, choice];
        }),
      ]),
    });

    const newPart = new Part().with({
      responses: Immutable.OrderedMap<string, Response>([
        ...targetAssessmentIds.map((t) => {
          const response = new Response().with({
            input: newInitiator.inputVal,
            match: t,
            feedback: Immutable.OrderedMap<string, Feedback>().withMutations((fb) => {
              const newFeedback = new Feedback();
              return fb.set(newFeedback.guid, newFeedback);
            }),
          });
          return [response.guid, response];
        }),
      ]),
    });

    const newModel = model.with({
      layoutData: model.layoutData.caseOf({
        just: ld => Maybe.just<HTMLLayout>(ld.with({
          initiators: ld.initiators.push(newInitiator),
        })),
        nothing: () => Maybe.nothing<HTMLLayout>(),
      }),
    });

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(newModel.guid, newModel),
      }),
      items: question.items.set(newItem.guid, newItem),
      parts: question.parts.set(newPart.guid, newPart),
    }));
  }

  deleteInitiator(initiatorId: string) {
    const { model, currentNode, onSelectInitiator } = this.props;
    const question = currentNode;

    const initiators = model.layoutData.caseOf({
      just: ld => (ld as HTMLLayout).initiators,
      nothing: () => Immutable.List<InitiatorModel>(),
    });

    // dont allow deletion of the last initiator
    if (initiators.size <= 1) {
      return;
    }

    // get initiator with specified id
    const initiator = initiators.find(i => i.guid === initiatorId);

    const updatedModel = model.with({
      layoutData: model.layoutData.caseOf({
        just: ld => Maybe.just<HTMLLayout>(ld.with({
          initiators: ld.initiators
            .filter(i => i.inputVal !== initiator.inputVal) as Immutable.List<InitiatorModel>,
        })),
        nothing: () => Maybe.nothing<HTMLLayout>(),
      }),
    });

    const itemKey = question.items.findKey(item =>
      (item as FillInTheBlank).id === initiator.inputVal);
    const partKey = question.parts.findKey(part =>
      part.responses.first() &&
      part.responses.first().input === initiator.inputVal);

    // select the first initiator in the new model
    updatedModel.layoutData.lift((ld: HTMLLayout) =>
      onSelectInitiator(ld.initiators.first()
        && ld.initiators.first().inputVal),
    );

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(updatedModel.guid, updatedModel),
      }),
      items: question.items.remove(itemKey),
      parts: question.parts.remove(partKey),
    }));
  }

  onTargetDrop(
    initiatorId: string, targetAssessmentId: string, originalTargetAssessmentId: string) {
    this.assignInitiator(initiatorId, targetAssessmentId);

    if (originalTargetAssessmentId && targetAssessmentId !== originalTargetAssessmentId) {
      this.unassignInitiator(initiatorId, originalTargetAssessmentId);
    }
  }

  onEditQuestion(question: Question) {
    const { documentId, currentPage, assessment, onSaveAssessment } = this.props;

    onSaveAssessment(documentId, assessment.with({
      pages: assessment.pages.set(currentPage.guid, currentPage.with({
        nodes: currentPage.nodes.set(question.guid, question),
      })),
    }));
  }

  onEditLayoutData(updatedLayoutData: HTMLLayout) {
    const { model, currentNode } = this.props;
    const question = currentNode;

    const updatedModel = model.with({
      layoutData: Maybe.just<HTMLLayout>(updatedLayoutData),
    });

    // save question updates
    this.onEditQuestion(question.with({
      body: question.body.with({
        content: question.body.content.set(updatedModel.guid, updatedModel),
      }),
    }));
  }

  renderMain() : JSX.Element {
    const { model, editMode, currentNode, selectedInitiator } = this.props;
    const question = currentNode;

    return model.layoutData.lift((layout) => {
      const targetArea = (layout as HTMLLayout).targetArea;

      switch (targetArea.contentType) {
        case 'DndTableTargetArea':
          return <HTMLTableEditor
                    table={targetArea as TableTargetArea}
                    initiators={layout.initiators}
                    question={question}
                    model={model}
                    selectedInitiator={selectedInitiator}
                    editMode={editMode}
                    onEditTable={targetArea =>
                      this.onEditLayoutData(layout.with({ targetArea }))}
                    onSelectInitiator={this.selectInitiator}
                    onTargetDrop={this.onTargetDrop}
                    onAddInitiator={this.addInitiator}
                    onDeleteInitiator={this.deleteInitiator}
                    onAssignInitiator={this.assignInitiator}
                    onUnassignInitiator={this.unassignInitiator}
                    onEditQuestion={this.onEditQuestion} />;
        case 'UnsupportedTargetArea':
        default:
          return (
            <div className="alert alert-warning" role="alert">
              This drag and drop layout type is not supported.
            </div>
          );
      }
    })
    .valueOr(
      <div className="alert alert-danger" role="alert">
        Could not load Drag and Drop layout. Please check the original XML.
      </div>,
    );
  }
}

const StyledDynaDragDropEditor = withStyles<DynaDragDropEditorProps>(styles)(DynaDragDropEditor);
export { StyledDynaDragDropEditor as DynaDragDropEditor };
