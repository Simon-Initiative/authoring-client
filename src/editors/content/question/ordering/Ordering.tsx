import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../../data/contentTypes';
import { Choice, ChoiceList, updateChoiceValuesAndRefs } from '../../common/Choice';
import { OrderingChoice, OrderingChoiceList } from './OrderingChoice';
import { Button } from '../../common/controls';
import guid from '../../../../utils/guid';
import {
  Question, QuestionProps, QuestionState,
} from '../question/Question';
import {
  TabSection, TabSectionContent, TabOptionControl, TabSectionHeader,
} from 'editors/content/common/TabContainer';
import { PermutationsMap } from 'types/combinations';
import { convert } from 'utils/format';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import {
  InputList, InputListItem, ItemOption, ItemOptionFlex, ItemOptions,
} from 'editors/content/common/InputList';
import {
  AUTOGEN_MAX_CHOICES, autogenResponseFilter, getGeneratedResponseItem,
  getGeneratedResponseBody, getGeneratedResponseScore, modelWithDefaultFeedback,
  renderMaxChoicesWarning,
} from 'editors/content/part/defaultFeedbackGenerator';
import { ALT_FLOW_ELEMENTS } from 'data/content/assessment/types';
import { ContentElements } from 'data/content/common/elements';

import './Ordering.scss';
import { ConditionalBranchSelect } from '../../common/BranchSelect';
import { classNames } from 'styles/jss';

export const isComplexFeedback = (partModel: contentTypes.Part) => {
  const responses = partModel.responses.filter(autogenResponseFilter).toArray();

  // scoring is complex (advanced mode) if there is more than 1
  // response OR score is not 0 or 1
  let prevEncounteredScore = false;
  const isAdvancedScoringMode = responses.length > 1 || responses.reduce(
    (acc, val, i) => {
      const score = +val.score;
      if (prevEncounteredScore && score !== 0) {
        return true;
      }
      if (score !== 0) {
        prevEncounteredScore = true;
      }

      return acc || (score !== 0 && score !== 1);
    },
    false,
  );

  return isAdvancedScoringMode;
};

export const resetAllFeedback = (partModel: contentTypes.Part) => {
  // remove all responses except the first (correct)
  let updateResponses = partModel.responses
    .filter(autogenResponseFilter)
    .slice(0, 1);

  // reset score of correct response
  updateResponses = updateResponses.map(r => r.with({ score: '1' }));

  const updatedPartModel = partModel.with({
    responses: updateResponses.toOrderedMap(),
  });

  return updatedPartModel;
};

const getLabelFromChoice = (itemModel: contentTypes.Ordering, choice: contentTypes.Choice) => {
  const choiceLabelMap = itemModel.choices.toArray().reduce(
    (acc, c, index) => acc.set(c.guid, convert.toAlphaNotation(index)),
    Immutable.Map<string, string>(),
  );

  return choiceLabelMap.get(choice.guid);
};

export interface OrderingProps extends QuestionProps<contentTypes.Ordering> {
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

export interface OrderingState extends QuestionState {

}

const buildResponsePlaceholder = (): contentTypes.Response => {
  const feedback = new contentTypes.Feedback({
    body: ContentElements.fromText('', '', ALT_FLOW_ELEMENTS),
  });
  const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

  return new contentTypes.Response({
    guid: guid(),
    score: '1',
    feedback: feedbacks.set(feedback.guid, feedback),
  });
};

/**
 * The content editor for HtmlContent.
 */
export class Ordering extends Question<OrderingProps, OrderingState> {
  defaultFeedbackResponse: contentTypes.Response;
  placeholderResponse: contentTypes.Response;

  constructor(props) {
    super(props);

    this.placeholderResponse = buildResponsePlaceholder();
  }

  /** Implement required abstract method to set className */
  getClassName() {
    return 'ordering';
  }

  componentDidMount() {
    const {
      partModel, model, advancedScoringInitialized, onToggleAdvancedScoring,
    } = this.props;

    // initialize advanced scoring if its not already
    if (!advancedScoringInitialized) {
      onToggleAdvancedScoring(model.guid, isComplexFeedback(partModel));
    }
  }

  onToggleShuffle = () => {
    const {
      itemModel,
      partModel,
      onEdit,
    } = this.props;

    onEdit(itemModel.with({ shuffle: !itemModel.shuffle }), partModel, null);
  }

  onToggleAdvanced = () => {
    const {
      itemModel, partModel, model, onToggleAdvancedScoring, advancedScoring, onEdit,
      onGetChoicePermutations,
    } = this.props;

    // if switching from advanced mode and feedback is complex, reset all feedback
    // so they are valid in simple mode. Otherwise, we can leave the feedback as-is
    if (advancedScoring && isComplexFeedback(partModel)) {
      let updatedPartModel = resetAllFeedback(partModel);

      // update part model with default feedback
      updatedPartModel = modelWithDefaultFeedback(
        updatedPartModel,
        itemModel.choices.toArray(),
        getGeneratedResponseBody(updatedPartModel),
        getGeneratedResponseScore(updatedPartModel),
        onGetChoicePermutations,
      );

      onEdit(itemModel, updatedPartModel, updatedPartModel);
    }

    onToggleAdvancedScoring(model.guid);
  }

  onAddChoice = () => {
    const { itemModel, partModel, onGetChoicePermutations, onEdit } = this.props;

    const count = itemModel.choices.size;
    const value = convert.toAlphaNotation(count);

    const choice = contentTypes.Choice.fromText('', guid()).with({ value });

    const updatedItemModel = itemModel.with(
      { choices: itemModel.choices.set(choice.guid, choice) });

    // add new choice to responses and regenerate default responses
    let updatedPartModel = partModel.with({
      responses: partModel.responses.map(r => r.with({
        match: r.match + `,${value}`,
      }),
      ).toOrderedMap(),
    });

    // update autogenerated responses
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      updatedItemModel.choices.toArray(),
      getGeneratedResponseBody(updatedPartModel),
      getGeneratedResponseScore(updatedPartModel),
      onGetChoicePermutations,
    );

    onEdit(updatedItemModel, updatedPartModel, choice);
  }

  onChoiceEdit = (choice: contentTypes.Choice, src) => {
    this.props.onEdit(
      this.props.itemModel.with(
        { choices: this.props.itemModel.choices.set(choice.guid, choice) }),
      this.props.partModel, src);
  }

  onPartEdit = (partModel: contentTypes.Part, src) => {
    this.props.onEdit(this.props.itemModel, partModel, src);
  }

  onResponseBodyEdit = (body, response, source) => {
    let feedback = response.feedback.first();
    feedback = feedback.with({ body });

    const updatedResponse = response.with({
      feedback: response.feedback.set(feedback.guid, feedback),
    });

    this.onResponseEdit(updatedResponse, source);
  }

  onResponseAdd = () => {
    const { itemModel, partModel } = this.props;

    const feedback = contentTypes.Feedback.fromText('', guid());
    const feedbacks = Immutable.OrderedMap<string, contentTypes.Feedback>();

    const response = new contentTypes.Response({
      score: '0',
      match: itemModel.choices.map(c => c.value).join(','),
      feedback: feedbacks.set(feedback.guid, feedback),
    });

    const updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    this.onPartEdit(updatedPartModel, null);
  }

  onResponseEdit = (response, src) => {
    const { partModel, itemModel, onGetChoicePermutations } = this.props;

    const choices = itemModel.choices.toArray();

    let updatedModel = partModel.with({
      responses: partModel.responses.set(response.guid, response),
    });

    updatedModel = modelWithDefaultFeedback(
      updatedModel,
      choices,
      getGeneratedResponseBody(updatedModel),
      getGeneratedResponseScore(updatedModel),
      onGetChoicePermutations,
    );

    this.onPartEdit(updatedModel, src);
  }

  onResponseRemove = (response) => {
    const { partModel, itemModel, onGetChoicePermutations } = this.props;

    const choices = itemModel.choices.toArray();

    let updatedModel = partModel.with({
      responses: partModel.responses.delete(response.guid),
    });

    updatedModel = modelWithDefaultFeedback(
      updatedModel,
      choices,
      getGeneratedResponseBody(updatedModel),
      getGeneratedResponseScore(updatedModel),
      onGetChoicePermutations,
    );

    this.onPartEdit(updatedModel, null);
  }

  onScoreEdit = (response, score) => {
    const { partModel } = this.props;

    this.onPartEdit(
      partModel.with({
        responses: partModel.responses.set(
          response.guid,
          response.with({ score }),
        ),
      }),
      null,
    );
  }

  onRemoveChoice = (choiceId: string) => {
    const { itemModel, partModel, onGetChoicePermutations } = this.props;

    // need at least 1 choice
    if (this.props.itemModel.choices.size <= 1) {
      return;
    }

    const removedChoiceVal = itemModel.choices.get(choiceId).value;

    const updatedItemModel = itemModel.with(
      { choices: itemModel.choices.delete(choiceId) });

    // add new choice to responses and regenerate default responses
    let updatedPartModel = partModel.with({
      responses: partModel.responses.map(r => r.with({
        match: r.match.split(',').filter(m => m !== removedChoiceVal).join(','),
      }),
      ).toOrderedMap(),
    });

    // update autogenerated responses
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      updatedItemModel.choices.toArray(),
      getGeneratedResponseBody(updatedPartModel),
      getGeneratedResponseScore(updatedPartModel),
      onGetChoicePermutations,
    );

    const newModels = updateChoiceValuesAndRefs(updatedItemModel, updatedPartModel);

    this.props.onEdit(newModels.itemModel, newModels.partModel, null);
  }

  onReorderChoices = (originalIndex: number, newIndex: number) => {
    const { onEdit, itemModel, partModel } = this.props;

    // convert OrderedMap to shallow javascript array
    const choices = itemModel.choices.toArray();

    // remove selected choice from array and insert it into new position
    const choice = choices.splice(originalIndex, 1)[0];
    choices.splice(newIndex, 0, choice);

    // update item model
    let updatedItemModel = itemModel;
    let updatedPartModel = partModel;
    updatedItemModel = itemModel.with({
      // set choices to a new OrderedMap with updated choice ordering
      choices: choices.reduce(
        (acc, c) => {
          return acc.set(c.guid, c);
        },
        Immutable.OrderedMap<string, contentTypes.Choice>(),
      ),
    });

    // update models with new choices and references
    const updatedModels = updateChoiceValuesAndRefs(updatedItemModel, partModel);
    updatedItemModel = updatedModels.itemModel;
    updatedPartModel = updatedModels.partModel;

    onEdit(
      updatedItemModel,
      updatedPartModel,
      choice,
    );
  }

  onReorderSelection = (
    response: contentTypes.Response,
    originalIndex: number,
    newIndex: number,
  ) => {
    const { itemModel, partModel, onEdit, onGetChoicePermutations } = this.props;

    const matches = response.match.split(',');

    // remove selected choice from array and insert it into new position
    const match = matches.splice(originalIndex, 1)[0];
    matches.splice(newIndex, 0, match);

    let updatedPartModel = partModel.with({
      responses: partModel.responses.set(response.guid, response.with({
        match: matches.join(','),
      })),
    });

    // update autogenerated responses
    updatedPartModel = modelWithDefaultFeedback(
      updatedPartModel,
      itemModel.choices.toArray(),
      getGeneratedResponseBody(updatedPartModel),
      getGeneratedResponseScore(updatedPartModel),
      onGetChoicePermutations,
    );

    onEdit(
      itemModel,
      updatedPartModel,
      response,
    );
  }

  onDefaultFeedbackEdit = (body: ContentElements, score: string, lang: string, src) => {
    const { partModel, itemModel, onGetChoicePermutations } = this.props;

    const choices = itemModel.choices.toArray();

    const updatedModel = modelWithDefaultFeedback(
      partModel,
      choices,
      body,
      score,
      onGetChoicePermutations,
      lang,
    );

    this.onPartEdit(updatedModel, src);
  }

  renderChoices = () => {
    const { itemModel, context, services, editMode } = this.props;

    return this.props.itemModel.choices
      .toArray()
      .map((choice, index) => {
        return (
          <Choice
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            key={choice.guid}
            index={index}
            choice={choice}
            allowReorder={!itemModel.shuffle}
            context={context}
            services={services}
            editMode={editMode}
            onReorderChoice={this.onReorderChoices}
            onEditChoice={this.onChoiceEdit}
            branchingQuestions={this.props.branchingQuestions}
            onRemove={this.props.itemModel.choices.size > 2 ?
              choiceId => this.onRemoveChoice(choiceId) :
              undefined} />
        );
      });
  }

  renderOrderSelection = (response: contentTypes.Response) => {
    const { itemModel, context, services } = this.props;

    const choiceValMap = itemModel.choices.reduce(
      (acc, choice) => acc.set(choice.value, choice),
      Immutable.Map<string, contentTypes.Choice>(),
    );

    // if match is empty, initialize it to the default choice order
    const match = response.match === ''
      ? itemModel.choices.map(c => c.value).join(',')
      : response.match;

    try {
      return match.split(',').map((choiceVal, index) => {
        const choice = choiceValMap.get(choiceVal);

        // create a "viewOnly" choice using the clone() method. This is necessary to prevent focus
        // from being stolen by this component from the actual choice when editing it's content.
        // It is used for rendering purposes only here
        const viewOnlyChoice = choice.clone();

        return (
          <OrderingChoice
            className="order-selection"
            onUpdateHover={() => { }}
            label={getLabelFromChoice(itemModel, choice)}
            key={viewOnlyChoice.guid}
            index={index}
            choice={viewOnlyChoice}
            context={context}
            services={services}
            onReorderChoice={(originalIndex, newIndex) =>
              this.onReorderSelection(response, originalIndex, newIndex)} />
        );
      });
    } catch (err) {
      // it is possible that not all values in match are valid choice values.
      // if that is the case, the xml data is invalid. Just display an error message.
      return (
        <div className="alert alert-danger" role="alert">
          Could not match choice and response. Please check the original XML.
        </div>
      );
    }
  }

  renderResponses = () => {
    const { partModel, context, services, advancedScoring, editMode,
      branchingQuestions } = this.props;

    // filter out all auto generated responses (identified by AUTOGEN string in name field)
    const userResponses = partModel.responses.toArray().filter(autogenResponseFilter);

    const responsesOrPlaceholder = userResponses.length === 0
      ? [this.placeholderResponse]
      : userResponses;

    return responsesOrPlaceholder
      .map((response, i) => {

        const feedback = response.feedback.first();

        return (
          <InputListItem
            activeContentGuid={this.props.activeContentGuid}
            hover={this.props.hover}
            onUpdateHover={this.props.onUpdateHover}
            onFocus={this.props.onFocus}
            key={response.guid}
            className={classNames(['response', !advancedScoring && 'simplefeedback'])}
            id={response.guid}
            label={advancedScoring && `${i + 1}`}
            contentTitle={!advancedScoring ? 'Correct' : ''}
            context={context}
            services={services}
            editMode={editMode}
            body={feedback.body}
            onEdit={(body, source) => this.onResponseBodyEdit(body, response, source)}
            onRemove={responsesOrPlaceholder.length <= 1
              ? null
              : () => this.onResponseRemove(response)
            }
            options={[
              <ItemOptions key="feedback-options">
                <ItemOption className="matches"
                  label="Drag choices to set ordering for this feedback" flex>
                  <OrderingChoiceList>
                    {this.renderOrderSelection(response)}
                  </OrderingChoiceList>
                </ItemOption>
                {advancedScoring
                  ? (
                    <ItemOption className="score" label="Score">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control input-sm form-control-sm"
                          disabled={!this.props.editMode}
                          value={response.score}
                          onChange={({ target: { value } }) => this.onScoreEdit(response, value)}
                        />
                      </div>
                    </ItemOption>
                  )
                  : (null)
                }
              </ItemOptions>,
            ]}>
            <ConditionalBranchSelect
              editMode={editMode}
              branch={feedback.lang}
              onChange={lang => this.onResponseEdit(
                response.with({
                  feedback: response.feedback.set(feedback.guid, feedback.with({ lang })),
                }),
                null)}
              questions={branchingQuestions}
            />
          </InputListItem>
        );
      });
  }

  renderDefaultResponse = () => {
    const { partModel, itemModel, context, services, advancedScoring, editMode,
      branchingQuestions } = this.props;

    const choices = itemModel.choices.toArray();

    // Questions with 1 choice cannot be incorrect, so don't display an incorrect feedback
    if (choices.length <= 1) {
      return null;
    }

    if (!this.defaultFeedbackResponse) {
      const newGuid = guid();

      this.defaultFeedbackResponse = new contentTypes.Response({
        feedback: Immutable.OrderedMap({
          [newGuid]: contentTypes.Feedback.fromText('', newGuid),
        }),
      });
    }

    const defaultResponseItem = getGeneratedResponseItem(partModel);
    const defaultFeedbackScore = getGeneratedResponseScore(partModel);

    let defaultResponse = this.defaultFeedbackResponse;
    if (defaultResponseItem) {
      defaultResponse = defaultResponse.with({
        feedback: defaultResponseItem.feedback,
      });
    }
    const feedback = defaultResponse.feedback.first();

    return (
      <InputListItem
        activeContentGuid={this.props.activeContentGuid}
        hover={this.props.hover}
        onUpdateHover={this.props.onUpdateHover}
        onFocus={this.props.onFocus}
        key={defaultResponse.guid}
        className={classNames(['response', !advancedScoring && 'simplefeedback'])}
        id={defaultResponse.guid}
        label={advancedScoring && ''}
        contentTitle="Incorrect"
        context={context}
        services={services}
        editMode={editMode}
        body={feedback.body}
        onEdit={(body, source) =>
          this.onDefaultFeedbackEdit(body, defaultFeedbackScore, feedback.lang, source)}
        options={[
          <ItemOptions key="feedback-options">
            {choices.length > AUTOGEN_MAX_CHOICES
              ? (
                renderMaxChoicesWarning()
              ) : (
                <ItemOptionFlex />
              )
            }
            {advancedScoring
              ? (
                <ItemOption className="score" label="Score">
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control input-sm form-control-sm"
                      disabled={!this.props.editMode}
                      value={defaultFeedbackScore}
                      onChange={({ target: { value } }) =>
                        this.onDefaultFeedbackEdit(feedback.body, value, feedback.lang, null)}
                    />
                  </div>
                </ItemOption>
              )
              : (null)
            }
          </ItemOptions>,
        ]}>
        <ConditionalBranchSelect
          editMode={editMode}
          branch={feedback.lang}
          onChange={lang =>
            this.onDefaultFeedbackEdit(feedback.body, defaultFeedbackScore, lang, null)}
          questions={branchingQuestions}
        />
      </InputListItem>
    );
  }

  renderResponseFeedback = () => {
    return (
      <div className="ordering-feedback">
        <InputList className="feedback-items">
          {this.renderResponses()}
          {this.renderDefaultResponse()}
        </InputList>
      </div>
    );
  }

  renderDetails() {
    const { editMode, itemModel, advancedScoring } = this.props;

    return (
      <React.Fragment>
        <TabSection key="choices" className="choices">
          <TabSectionHeader title="Choices">
            <TabOptionControl name="add-choice">
              <Button
                editMode={editMode}
                type="link"
                onClick={this.onAddChoice}>
                Add Choice
              </Button>
            </TabOptionControl>
            <TabOptionControl name="shuffle">
              <ToggleSwitch
                checked={itemModel.shuffle}
                label="Shuffle"
                onClick={this.onToggleShuffle} />
            </TabOptionControl>
            <TabOptionControl name="advanced">
              <ToggleSwitch
                checked={advancedScoring}
                label="Advanced"
                onClick={this.onToggleAdvanced} />
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <ChoiceList className="ordering-question-choices">
              {this.renderChoices()}
            </ChoiceList>
          </TabSectionContent>
        </TabSection>
        <TabSection key="feedback" className="feedback">
          <TabSectionHeader title="Feedback">
            {advancedScoring &&
              <TabOptionControl name="add-feedback">
                <Button
                  editMode={editMode}
                  type="link"
                  onClick={this.onResponseAdd}>
                  Add Feedback
                </Button>
              </TabOptionControl>
            }
          </TabSectionHeader>
          <TabSectionContent>
            {this.renderResponseFeedback()}
          </TabSectionContent>
        </TabSection>
      </React.Fragment>
    );
  }

  renderAdditionalTabs() {
    // no additional tabs
    return false;
  }
}
