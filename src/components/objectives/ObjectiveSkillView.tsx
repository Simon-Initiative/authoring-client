import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { bindActionCreators } from 'redux';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { collapseNodes, expandNodes } from 'actions/expand';
import { AppServices, DispatchBasedServices } from 'editors/common/AppServices';
import * as viewActions from 'actions/view';
import { DuplicateListingInput } from 'components/objectives/DuplicateListingInput';
import guid from 'utils/guid';
import { buildReadOnlyMessage } from 'utils/lock';
import { buildPersistenceFailureMessage } from 'utils/error';
import { LoadingSpinner } from 'components/common/LoadingSpinner.tsx';
import { ExistingSkillSelection } from 'components/objectives/ExistingSkillSelection';
import {
  AggregateModel, buildAggregateModel, UnifiedObjectivesModel,
  UnifiedSkillsModel, unifyObjectives, unifySkills,
} from 'components/objectives/persistence';
import * as Messages from 'types/messages';
import { UserState } from 'reducers/user';
import { Objective } from 'components/objectives/Objective';
import { QuestionRef, PoolInfo } from 'components/objectives/utils';
import { RegisterLocks, UnregisterLocks } from 'types/locks';
import { LearningObjectivesModel } from 'data/models/objective';
import { SkillsModel } from 'data/models/skill';
import { logger, LogTag, LogLevel, LogAttribute, LogStyle } from 'utils/logger';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import DeleteObjectiveSkillModal from 'components/objectives/DeleteObjectiveSkillModal';
import { LegacyTypes } from 'data/types';
import { ModalMessage } from 'utils/ModalMessage';
import { ExpandedState } from 'reducers/expanded';
import { RawContentEditor } from './RawContentEditor';
import SearchBar from 'components/common/SearchBar';
import { Edge, PathElement } from 'types/edge';
import { ConfirmModal } from 'components/ConfirmModal';

import './ObjectiveSkillView.scss';

type SkillPathElement = PathElement & { title?: string };

const getPoolQuestionCount = (pathItem: SkillPathElement) => {
  // base case: if this pathItem is a pool, return the questionCount
  switch (pathItem.name) {
    case 'pool':
      return Maybe.just({
        questionCount: pathItem['questionCount'],
      });
    default:
      break;
  }
  if (pathItem.parent) {
    return getPoolQuestionCount(pathItem.parent);
  }

  // no parent exists. this is the end of the path and a pool parent has not been found
  return Maybe.nothing();
};

const getQuestionRefFromPathInfo = (
  pathItem: SkillPathElement, assessmentType: LegacyTypes,
  assessmentId: string): Maybe<QuestionRef> => {
  // base case: if this pathItem is a question, return the QuestionRef
  switch (pathItem.name) {
    case 'essay':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'essay',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'short_answer':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'short_answer',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'fill_in_the_blank':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'fill_in_the_blank',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'image_hotspot':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'image_hotspot',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'multiple_choice':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'multiple_choice',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'numeric':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'numeric',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'ordering':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'ordering',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    case 'question':
      return Maybe.just({
        key: `${assessmentId}:${pathItem['@id']}`,
        id: pathItem['@id'],
        title: pathItem.title
          ? Maybe.just(pathItem.title) : Maybe.nothing<string>(),
        type: 'question',
        assessmentType,
        assessmentId,
        poolInfo: getPoolQuestionCount(pathItem),
      });
    default:
      break;
  }

  // item is not a question, recurse on parent if it exists
  if (pathItem.parent) {
    return getQuestionRefFromPathInfo(pathItem.parent, assessmentType, assessmentId);
  }

  // no parent exists. this is the end of the path and a question has not been found
  return Maybe.nothing();
};

const getQuestionRefFromSkillEdge = (
  edge: Edge, assessmentType: LegacyTypes, assessmentId: string): Maybe<QuestionRef> => {
  return getQuestionRefFromPathInfo(
    edge.metadata.jsonObject.pathInfo, assessmentType, assessmentId);
};

const getPoolInfoFromPoolRefEdge = (edge: Edge, questionCount: number): Maybe<PoolInfo> => {
  const pathInfo = edge.metadata.jsonObject.pathInfo;
  return Maybe.just({
    questionCount,
    count: Number(pathInfo.parent['@count']),
    exhaustion: pathInfo.parent['@exhaustion'],
    strategy: pathInfo.parent['@strategy'],
  });
};

export const reduceObjectiveWorkbookPageRefs = (
  objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>,
  workbookpageToObjectiveEdges: Edge[],
) => objectives.reduce(
  (acc, objective) => acc.set(
    objective.id,
    (acc.get(objective.id) || Immutable.List<string>())
      .concat(
        workbookpageToObjectiveEdges
          // filter out edges that dont point to this objective
          .filter(edge => edge.destinationId.split(':')[2] === objective.id)
          // map to workbook page ids
          .map(edge => edge.sourceId.split(':')[2]),
      ).toList(),
  ),
  Immutable.Map<string, Immutable.List<string>>(),
);

export const reduceSkillFormativeQuestionRefs = (
  skills: Immutable.OrderedMap<string, contentTypes.Skill>,
  formativeToSkillEdges: Edge[],
) => skills.reduce(
  (acc, skill) => acc.set(
    skill.id,
    (acc.get(skill.id) || Immutable.List<QuestionRef>())
      .concat(
        formativeToSkillEdges.filter(edge => edge.destinationId.split(':')[2] === skill.id)
          .map(edge =>
            getQuestionRefFromSkillEdge(
              edge, LegacyTypes.inline, edge.sourceId.split(':')[2]))
          .filter(maybeQuestionRef => maybeQuestionRef.caseOf({
            just: ref => true,
            nothing: () => false,
          }))
          .map(maybeQuestionRef => maybeQuestionRef.valueOrThrow()),
      ).toList(),
  ),
  Immutable.Map<string, Immutable.List<QuestionRef>>(),
);

export const reduceSkillSummativeQuestionRefs = (
  skills: Immutable.OrderedMap<string, contentTypes.Skill>,
  summativeToSkillEdges: Edge[],
) => skills.reduce(
  (acc, skill) => acc.set(
    skill.id,
    (acc.get(skill.id) || Immutable.List<QuestionRef>())
      .concat(
        summativeToSkillEdges.filter(edge => edge.destinationId.split(':')[2] === skill.id)
          .map(edge => getQuestionRefFromSkillEdge(
            edge, LegacyTypes.assessment2, edge.sourceId.split(':')[2]))
          .filter(maybeQuestionRef => maybeQuestionRef.caseOf({
            just: ref => true,
            nothing: () => false,
          }))
          .map(maybeQuestionRef => maybeQuestionRef.valueOrThrow()),
      ).toList(),
  ),
  Immutable.Map<string, Immutable.List<QuestionRef>>(),
);

export const reduceSkillPoolQuestionRefs = (
  skills: Immutable.OrderedMap<string, contentTypes.Skill>,
  poolToSkillEdges: Edge[],
  assessmentToPoolEdges: Edge[],
) => skills.reduce(
  (acc, skill) => acc.set(
    skill.id,
    (acc.get(skill.id) || Immutable.List<QuestionRef>())
      .concat(
        poolToSkillEdges.filter(edge => edge.destinationId.split(':')[2] === skill.id)
          .map(edge => getQuestionRefFromSkillEdge(
            edge, LegacyTypes.assessment2_pool, edge.sourceId.split(':')[2]))
          .filter(maybeQuestionRef => maybeQuestionRef.caseOf({
            just: ref => true,
            nothing: () => false,
          }))
          .map(maybeQuestionRef => maybeQuestionRef.bind(questionRef => Maybe.just({
            ...questionRef,
            poolInfo: getPoolInfoFromPoolRefEdge(
              assessmentToPoolEdges.find(
                e => e.destinationId.split(':')[2] === questionRef.assessmentId),
              questionRef.poolInfo.valueOr({ questionCount: 0 }).questionCount,
            ),
          })))
          .map(maybeQuestionRef => maybeQuestionRef.valueOrThrow()),
      ).toList(),
  ),
  Immutable.Map<string, Immutable.List<QuestionRef>>(),
);

export interface ObjectiveSkillViewProps {
  userName: string;
  user: UserState;
  course: models.CourseModel;
  dispatch: any;
  expanded: ExpandedState;
  skills: Immutable.OrderedMap<string, contentTypes.Skill>;
  onFetchSkills: (courseId: string) => any;
  onSetSkills: (skills: Immutable.OrderedMap<string, contentTypes.Skill>) => void;
  onUpdateSkills: (skills: Immutable.OrderedMap<string, contentTypes.Skill>) => void;
  onSetObjectives: (objectives: Immutable.OrderedMap<string,
    contentTypes.LearningObjective>) => void;
  onUpdateObjectives: (objectives: Immutable.OrderedMap<string,
    contentTypes.LearningObjective>) => void;
  showMessage: (message: Messages.Message) => void;
  registerLocks: RegisterLocks;
  unregisterLocks: UnregisterLocks;
  selectedOrganization: Maybe<models.OrganizationModel>;
  dismissMessage: (message: Messages.Message) => void;
  displayModal: (component: any) => void;
  dismissModal: () => void;
  onPushRoute: (path: string) => void;
}

interface ObjectiveSkillViewState {
  aggregateModel: AggregateModel;
  skills: UnifiedSkillsModel;
  objectives: UnifiedObjectivesModel;
  filteredObjectives: Maybe<Immutable.OrderedMap<string, contentTypes.LearningObjective>>;
  overrideExpanded: boolean;
  isSavePending: boolean;
  loading: boolean;
  organizationResourceMap: Maybe<Immutable.Map<string, Immutable.List<string>>>;
  skillQuestionRefs: Maybe<Immutable.Map<string, Immutable.List<QuestionRef>>>;
  workbookPageRefs: Maybe<Immutable.Map<string, Immutable.List<string>>>;
  searchText: string;
}

// The Learning Objectives and Skills documents require specialized handling
// because we need to present a unified view to the end user.  Different
// from workbook pages, assessments, and organizations, LOs and skills are
// not edited on a per-document basis.  We tried that first and the
// multilevel UI was confusing and cumbersome for users.  So instead we
// abstract away the presence of multiple documents and present a single,
// unified UI where the user can create and edit LOs and skills.


export class ObjectiveSkillView
  extends React.Component<ObjectiveSkillViewProps, ObjectiveSkillViewState> {

  viewActions: Object;
  services: AppServices;
  unmounted: boolean;
  failureMessage: Maybe<Messages.Message>;

  constructor(props) {
    super(props);

    this.state = {
      aggregateModel: null,
      skills: null,
      objectives: null,
      filteredObjectives: Maybe.nothing(),
      overrideExpanded: false,
      isSavePending: false,
      loading: false,
      organizationResourceMap: Maybe.nothing(),
      skillQuestionRefs: Maybe.nothing(),
      workbookPageRefs: Maybe.nothing(),
      searchText: '',
    };
    this.unmounted = false;
    this.failureMessage = Maybe.nothing<Messages.Message>();
    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
    this.createNew = this.createNew.bind(this);
    this.onObjectiveEdit = this.onObjectiveEdit.bind(this);
    this.onSkillEdit = this.onSkillEdit.bind(this);
    this.onAddNewSkill = this.onAddNewSkill.bind(this);
    this.onAddExistingSkill = this.onAddExistingSkill.bind(this);
    this.onToggleExpanded = this.onToggleExpanded.bind(this);
    this.onExistingSkillInsert = this.onExistingSkillInsert.bind(this);
    this.onBeginExternalEdit = this.onBeginExternalEdit.bind(this);

    this.services = new DispatchBasedServices(
      this.props.dispatch,
      this.props.course,
    );
  }

  componentDidMount() {
    this.buildModels();

    if (this.props.skills.size === 0) {
      this.fetchSkills();
    }
  }

  componentWillUpdate(
    nextProps: Readonly<ObjectiveSkillViewProps>, nextState: Readonly<ObjectiveSkillViewState>) {
    // this assumes that aggregateModel, skills, objectives are all set together
    if (nextState.aggregateModel !== null
      && nextState.aggregateModel !== this.state.aggregateModel) {
      this.fetchAllRefs(this.props.skills, nextState.objectives);

    } else if (this.state.aggregateModel !== null && nextProps.skills !== this.props.skills) {
      this.fetchAllRefs(nextProps.skills, this.state.objectives);
    }
  }

  componentWillUnmount() {

    this.unmounted = true;

    if (this.state.aggregateModel !== null
      && this.state.aggregateModel.isLocked) {

      this.releaseAllLocks([
        ...this.state.objectives.documents,
        ...this.state.skills.documents,
      ]);

    }
  }

  fetchSkills() {
    const { course, onFetchSkills } = this.props;
    onFetchSkills(course.id);
  }

  fetchAllRefs(
    skills: Immutable.OrderedMap<string, contentTypes.Skill>,
    objectivesModel: UnifiedObjectivesModel,
  ) {
    const { course } = this.props;

    // fetch all organizations for course
    const fetchAllOrgResources = persistence.bulkFetchDocuments(
      course.guid, [LegacyTypes.organization], 'byTypes');


    // fetch workbook page to inline assessment edges
    const fetchWorkbookPageToInlineEdges = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.workbook_page,
      destinationType: LegacyTypes.inline,
    });

    // fetch workbook page to inline assessment edges
    const fetchWorkbookPageToSummativeEdges = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.workbook_page,
      destinationType: LegacyTypes.assessment2,
    });

    // fetch summative assessment to pool edges
    const fetchSummativeToPoolEdges = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.assessment2,
      destinationType: LegacyTypes.assessment2_pool,
    });

    // fetch workbook page to objective refs
    const fetchWorkbookPageToObjectiveEdges = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.workbook_page,
      destinationType: LegacyTypes.learning_objective,
    }).then((workbookpageToObjectiveEdges) => {
      return reduceObjectiveWorkbookPageRefs(
        objectivesModel.objectives, workbookpageToObjectiveEdges);
    });

    // fetch all formative assessment edges and build skill-formative refs map
    const fetchFormativeRefs = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.inline,
    }).then((formativeToSkillEdges) => {
      return reduceSkillFormativeQuestionRefs(skills, formativeToSkillEdges);
    });

    // fetch all summative assessment edges and build skill-summative refs map
    const fetchSummativeRefs = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.assessment2,
    }).then((summativeToSkillEdges) => {
      return reduceSkillSummativeQuestionRefs(skills, summativeToSkillEdges);
    });

    // fetch all question pool assessment edges and build skill-pool refs map
    const fetchPoolRefs = persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.assessment2_pool,
    }).then((poolToSkillEdges) => {
      return persistence.fetchEdges(course.guid, {
        sourceType: LegacyTypes.assessment2,
        destinationType: LegacyTypes.assessment2_pool,
      })
      .then((assessmentToPoolEdges) => {
        return {
          poolToSkillEdges,
          assessmentToPoolEdges,
        };
      });
    }).then(({ poolToSkillEdges, assessmentToPoolEdges }) => {
      return reduceSkillPoolQuestionRefs(skills, poolToSkillEdges, assessmentToPoolEdges);
    });

    Promise.all([
      fetchAllOrgResources,
      fetchWorkbookPageToObjectiveEdges,
      fetchWorkbookPageToInlineEdges,
      fetchWorkbookPageToSummativeEdges,
      fetchSummativeToPoolEdges,
      fetchFormativeRefs,
      fetchSummativeRefs,
      fetchPoolRefs,
    ]).then(([
      orgDocs,
      workbookPageRefs,
      workbookPageToInlineEdges,
      workbookPageToSummativeEdges,
      summativeToPoolEdges,
      skillFormativeQuestionRefs,
      skillSummativeQuestionRefs,
      skillPoolQuestionRefs,
    ]) => {
      // compute org resources map
      const combinedEdges = [
        ...workbookPageToInlineEdges,
        ...workbookPageToSummativeEdges,
        ...summativeToPoolEdges,
      ];
      const organizationResourceMap = orgDocs.reduce(
        (orgAcc, orgDoc) => {
          const org = orgDoc.model as models.OrganizationModel;
          const orgResources = org.getFlattenedResources();

          return orgAcc.set(
            org.resource.id,
            orgResources.concat(
              combinedEdges
                .filter(edge => orgResources.contains(edge.sourceId.split(':')[2]))
                .map(edge => edge.destinationId.split(':')[2]),
            ).toList(),
          );
        },
        Immutable.Map<string, Immutable.List<string>>(),
      );

      this.setState({
        organizationResourceMap: Maybe.just(organizationResourceMap),
        workbookPageRefs: Maybe.just(workbookPageRefs),
        skillQuestionRefs: Maybe.just(
          skills.reduce(
            (acc, skill) => acc.set(
              skill.id,
              Immutable.List<QuestionRef>()
                .concat(skillFormativeQuestionRefs.get(skill.id))
                .concat(skillSummativeQuestionRefs.get(skill.id))
                .concat(skillPoolQuestionRefs.get(skill.id))
                .toList(),
            ),
            Immutable.Map<string, Immutable.List<QuestionRef>>(),
          ),
        ),
      });
    });

  }

  releaseAllLocks(documents) {

    const courseId = this.props.course.guid;
    const locks = documents.map(d => ({ courseId, documentId: d._id }));

    locks.forEach((lock) => {
      const { courseId, documentId } = lock;
      persistence.releaseLock(courseId, documentId);
    });

    this.props.unregisterLocks(locks);
  }

  buildModels() {

    const courseId = this.props.course.guid;
    const userName = this.props.userName;

    return buildAggregateModel(courseId, userName)
      .then((aggregateModel) => {

        // We need to check to see if the component has unmounted
        // before buildAggregateModel completed.  This can happen if
        // the user clicks on this view and immediately clicks on
        // another.  In this case we need to release the locks that
        // were just acquired by buildAggregateModel
        if (this.unmounted) {
          this.releaseAllLocks([...aggregateModel.objectives, ...aggregateModel.skills]);

        } else {

          this.logObjectivesAndSkills(aggregateModel);

          if (aggregateModel.isLocked) {

            const locks = [...aggregateModel.objectives, ...aggregateModel.skills]
              .map(d => ({ courseId: this.props.course.guid, documentId: d._id }));
            this.props.registerLocks(locks);

          } else {
            this.props.showMessage(buildReadOnlyMessage(aggregateModel.lockDetails, undefined));
          }

          const skills = unifySkills(aggregateModel);
          const objectives = unifyObjectives(aggregateModel);

          // We got a fresh look at the skills and objectives, let the application know
          // about it so that others can take advantage
          this.props.onSetSkills(skills.skills);
          this.props.onSetObjectives(objectives.objectives);

          this.setState({
            aggregateModel,
            objectives,
            skills,
          });
        }
      });
  }

  expandAllObjectives() {
    if (!this.state.objectives) {
      return;
    }
    const objectiveIds = this.state.objectives.objectives.toArray().map(o => o.id);
    this.props.dispatch(expandNodes('objectives', objectiveIds));
  }

  logObjectivesAndSkills(aggregateModel: AggregateModel) {
    const { objectives, skills } = aggregateModel;

    const objectiveObjects = objectives.map(objective =>
      (objective.model as LearningObjectivesModel)
        .objectives
        .toArray()
        .map(o => ({ title: o.title, id: o.id })));

    const skillObjects = skills.map(skill => (skill.model as SkillsModel)
      .skills
      .toArray()
      .map(s => ({ title: s.title, id: s.id })));

    logger.group(
      LogLevel.INFO,
      LogTag.DEFAULT,
      `Objective Details:`,
      (logger) => {
        objectiveObjects[0].forEach((objective) => {
          logger
            .setVisibility(LogAttribute.TAG, false)
            .setVisibility(LogAttribute.DATE, false)
            .info(LogTag.DEFAULT, `${objective.title} (id: ${objective.id})`);
        });
      },
      LogStyle.HEADER + LogStyle.BLUE,
    );

    logger.group(
      LogLevel.INFO,
      LogTag.DEFAULT,
      `Skill Details:`,
      (logger) => {
        skillObjects[0].forEach((skill) => {
          logger
            .setVisibility(LogAttribute.TAG, false)
            .setVisibility(LogAttribute.DATE, false)
            .info(LogTag.DEFAULT, `${skill.title} (${skill.id})`);
        });
      },
      LogStyle.HEADER + LogStyle.BLUE,
    );
  }

  saveCompleted() {
    this.setState({ isSavePending: false });

    this.failureMessage.lift(m => this.props.dismissMessage(m));
    this.failureMessage = Maybe.nothing<Messages.Message>();
  }

  failureEncountered(error: string) {
    this.setState({ isSavePending: false });

    this.failureMessage = Maybe.just(buildPersistenceFailureMessage(
      error, this.props.user.profile));
    this.failureMessage.lift(m => this.props.showMessage(m));
  }

  onObjectiveEdit(obj: contentTypes.LearningObjective) {

    const originalDocument = this.state.objectives.mapping.get(obj.id);

    const objectives = (originalDocument.model as models.LearningObjectivesModel)
      .objectives.set(obj.guid, obj);
    const model =
      (originalDocument.model as models.LearningObjectivesModel)
        .with({ objectives });

    const updatedDocument = originalDocument.with({ model });

    const unified = Object.assign({}, this.state.objectives);

    const index = unified.documents.indexOf(originalDocument);

    unified.documents[index] = updatedDocument;
    unified.objectives = unified.objectives.set(obj.id, obj);

    const idsToDocument = unified.mapping
      .filter((doc, id) => doc._id === originalDocument._id)
      .map((doc, id) => updatedDocument)
      .toOrderedMap();
    unified.mapping = unified.mapping.merge(idsToDocument);

    if (originalDocument._id === unified.newBucket._id) {
      unified.newBucket = updatedDocument;
    }

    this.setState(
      { objectives: unified, isSavePending: true },

      () => persistence.persistDocument(updatedDocument)
        .then(result => this.saveCompleted())
        .catch(error => this.failureEncountered(error)),
    );

    this.props.onUpdateObjectives(Immutable.OrderedMap(
      [[obj.get('id'), obj]]));
  }

  onSkillEdit(model: contentTypes.Skill) {
    const { onUpdateSkills } = this.props;

    // Based on the skill id, find the document that this skill lives in
    const originalDocument = this.state.skills.mapping.get(model.id);

    // Now update the skills model contained within that document, yielding
    // ultimately an updated document
    const skills = (originalDocument.model as models.SkillsModel)
      .skills.set(model.guid, model);
    const updatedModel =
      (originalDocument.model as models.SkillsModel)
        .with({ skills });
    const updatedDocument = originalDocument.with({ model: updatedModel });

    // Determine if we are making an edit to our special document that
    // handles all additions
    const isEditingNewBucket = originalDocument._id === this.state.skills.newBucket._id;

    // Create a copy of our current unified skills model
    const unified = Object.assign({}, this.state.skills);
    unified.documents = [...this.state.skills.documents];

    // Now update that copy
    const index = unified.documents.findIndex(d => originalDocument._id === d._id);
    unified.documents[index] = updatedDocument;
    unified.skills = unified.skills.set(model.id, model);

    // We need to update the mapping of EVERY skill that exists in this
    // original document to point to the updated document
    const idsToDocument = unified.mapping
      .filter((doc, id) => doc._id === originalDocument._id)
      .map((doc, id) => updatedDocument)
      .toOrderedMap();
    unified.mapping = unified.mapping.merge(idsToDocument);

    if (isEditingNewBucket) {
      unified.newBucket = updatedDocument;
    }

    this.setState(
      { skills: unified, isSavePending: true },

      () => persistence.persistDocument(updatedDocument)
        .then(result => this.saveCompleted())
        .catch(error => this.failureEncountered(error)),
    );

    onUpdateSkills(Immutable.OrderedMap([[model.id, model]]));
  }

  createNewSkill(): Promise<string> {
    const { onUpdateSkills } = this.props;

    // Create the new skill and persist it
    const id = guid();
    const skill = new contentTypes.Skill().with({
      id,
      guid: id,
      title: 'New skill',
    });

    const model = (this.state.skills.newBucket.model as models.SkillsModel);
    const updatedModel = model.with({ skills: model.skills.set(skill.guid, skill) });
    const updatedDocument = this.state.skills.newBucket.with({ model: updatedModel });

    const unified = Object.assign({}, this.state.skills);

    const index = unified.documents.indexOf(this.state.skills.newBucket);

    unified.documents[index] = updatedDocument;
    unified.mapping = unified.mapping.set(id, updatedDocument);
    unified.skills = unified.skills.set(skill.id, skill);
    unified.newBucket = updatedDocument;

    return new Promise((resolve, reject) => {

      this.setState(
        { skills: unified, isSavePending: true },

        () => persistence.persistDocument(updatedDocument)
          .then((result) => {
            this.saveCompleted();
            resolve(skill.id);
          })
          .catch((error) => {
            this.failureEncountered(error);
            reject(error);
          }),
      );

      onUpdateSkills(Immutable.OrderedMap([[skill.id, skill]]));

    });

  }


  attachSkills(model: contentTypes.LearningObjective, strings: string[]) {
    const skills = Immutable.List<string>(model.skills.toArray().concat(strings));
    this.onObjectiveEdit(model.with({ skills }));
  }

  onAddNewSkill(model: contentTypes.LearningObjective) {

    this.createNewSkill()
      .then((id) => {
        const updated = model.with({ skills: model.skills.push(id) });
        this.onObjectiveEdit(updated);
      });
  }

  onExistingSkillInsert(model: contentTypes.LearningObjective, string: string) {
    this.services.dismissModal();

    const updated = model.with({ skills: model.skills.concat(string) as Immutable.List<string> });
    this.onObjectiveEdit(updated);
  }

  onAddExistingSkill(model: contentTypes.LearningObjective) {
    const availableSkills = [];

    interface SkillsMap {
      [id: string]: contentTypes.Skill;
    }

    const toSkillsMap = (skills: contentTypes.Skill[]): SkillsMap =>
      skills
        .reduce(
          (map, skill) => {
            map[skill.id] = skill;
            return map;
          },
          {});

    const allSkills =
      toSkillsMap(this.state.skills.skills.toArray());

    const attachedSkills =
      toSkillsMap(model.skills.map(id => allSkills[id]).toArray());

    // Not all skills fetched from server are attached to any objectives.
    // We filter out the completely unattached skills and the skills already attached
    // to this objective.
    this.state.objectives.objectives
      .toArray()
      .forEach((objective: contentTypes.LearningObjective) => {
        objective.skills.forEach((id) => {
          const skill = allSkills[id];
          if (skill !== undefined && !attachedSkills[id]) {
            availableSkills.push(skill);
          }
        });
      });

    const skills = Immutable.Set<contentTypes.Skill>(availableSkills);

    // Allow the user to choose the skills to attach
    this.services.displayModal(<ExistingSkillSelection
      skills={skills.toList()}
      objective={model}
      onInsert={this.onExistingSkillInsert}
      onCancel={() => this.services.dismissModal()}
      disableInsert={skills.size === 0} />);

    // Attach the skill ids to the objective and then persist that
  }

  detachSkill(objective: contentTypes.LearningObjective, model: contentTypes.Skill) {
    // Update the parent objective
    const index = objective.skills.indexOf(model.id);
    const skills = objective.skills.remove(index);
    const updated = objective.with({ skills });

    this.onObjectiveEdit(updated);
  }

  deleteSkill(skill: contentTypes.Skill) {
    const originalDocument = this.state.skills.mapping.get(skill.id);

    const skills = (originalDocument.model as models.SkillsModel)
      .skills.delete(skill.guid);
    const model =
      (originalDocument.model as models.SkillsModel)
        .with({ skills });

    const updatedDocument = originalDocument.with({ model });

    const unified = Object.assign({}, this.state.skills);

    const index = unified.documents.indexOf(originalDocument);

    unified.documents[index] = updatedDocument;
    unified.skills = unified.skills.delete(skill.id);

    // We need to remap the existing skill ids to the
    // new version of the edited document
    const idsToDocument = unified.mapping
      .filter((doc, id) => doc._id === originalDocument._id)
      .map((doc, id) => updatedDocument)
      .toOrderedMap();
    unified.mapping = unified.mapping.merge(idsToDocument);

    if (originalDocument === unified.newBucket) {
      unified.newBucket = updatedDocument;
    }

    this.setState(
      { skills: unified, isSavePending: true },

      () => persistence.persistDocument(updatedDocument)
        .then(result => this.saveCompleted())
        .catch(error => this.failureEncountered(error)),
    );

    this.props.onSetSkills(unified.skills);
  }

  // WARNING: Do not use countSkillRefs from within a render
  // method or within a for-loop of any kind, given that
  // this impl is O(obj * skills) with respect to the number of objectives
  // and skills mapped to them
  countSkillRefs(model: contentTypes.Skill): number {
    return this.state.objectives.objectives
      .toArray()
      .map(o => o.skills.contains(model.id) ? 1 : 0)
      .reduce((acc, count) => acc + count, 0);
  }

  removeSkill(objective: contentTypes.LearningObjective, model: contentTypes.Skill) {

    // We simply detach when this skill is present in more than
    // one objective.
    if (this.countSkillRefs(model) > 1) {

      this.detachSkill(objective, model);

    } else {
      // Otherwise, we will perform a true delete, but only if the
      // skill is not referenced by any assessments
      this.canDeleteSkill(model)
        .then((canDelete) => {

          if (canDelete) {
            this.detachSkill(objective, model);
            this.deleteSkill(model);
          }
        });
    }

  }

  canDeleteObjective(obj: contentTypes.LearningObjective): Promise<boolean> {
    const { course } = this.props;

    if (obj.skills.size > 0) {
      this.services.displayModal(
        <ModalMessage
          onCancel={() => this.services.dismissModal()}
          okLabel="Ok">
          All skills must be removed from an objective before the objective can be deleted.
        </ModalMessage>);
      return Promise.resolve(false);
    }

    this.setState({
      loading: true,
    });

    return persistence.fetchWebContentReferences(course.guid, { destinationId: obj.id })
      .then((edges) => {
        this.setState({
          loading: false,
        });

        if (edges.length === 0) {
          return Promise.resolve(true);
        }
        this.services.displayModal(
          <DeleteObjectiveSkillModal
            model={obj}
            course={course}
            edges={edges}
            services={this.services} />);
        return Promise.resolve(false);
      })
      .catch((err) => {
        console.log(`Error removing objective ${obj}: ${err}`);
        this.setState({
          loading: false,
        });
        return Promise.resolve(false);
      });
  }

  canDeleteSkill(skill: contentTypes.Skill): Promise<boolean> {

    const { course } = this.props;

    this.setState({
      loading: true,
    });

    return persistence.fetchWebContentReferences(course.guid, { destinationId: skill.id })
      .then((edges) => {

        this.setState({
          loading: false,
        });

        // Remove edges where the source is an objective, since we know there is only one
        // objective linking to this skill
        const withoutObjectives = edges.filter(e =>
          e.sourceType !== LegacyTypes.learning_objective);

        if (withoutObjectives.length === 0) {
          return Promise.resolve(true);
        }
        this.services.displayModal(
          <DeleteObjectiveSkillModal
            services={this.services}
            course={course}
            model={skill}
            edges={withoutObjectives} />);
        return Promise.resolve(false);
      })
      .catch((err) => {
        console.error(`Error removing skill ${skill}: ${err}`);
        this.setState({
          loading: false,
        });
        return Promise.resolve(false);
      });
  }


  removeObjective(obj: contentTypes.LearningObjective) {

    this.canDeleteObjective(obj)
      .then((canDelete) => {
        if (canDelete) {
          const confirmDelete = () => {
            const originalDocument = this.state.objectives.mapping.get(obj.id);

            const objectives = (originalDocument.model as models.LearningObjectivesModel)
              .objectives.delete(obj.guid);
            const model =
              (originalDocument.model as models.LearningObjectivesModel)
                .with({ objectives });

            const updatedDocument = originalDocument.with({ model });

            const unified = Object.assign({}, this.state.objectives);

            const index = unified.documents.indexOf(originalDocument);

            unified.documents[index] = updatedDocument;
            unified.objectives = unified.objectives.delete(obj.id);

            // We need to remap the existing objective ids to the
            // new version of the newBucket document
            const idsToDocument = unified.mapping
              .filter((doc, id) => doc._id === originalDocument._id)
              .map((doc, id) => updatedDocument)
              .toOrderedMap();
            unified.mapping = unified.mapping.merge(idsToDocument);

            if (originalDocument === unified.newBucket) {
              unified.newBucket = updatedDocument;
            }

            this.setState(
              { objectives: unified, isSavePending: true },

              () => persistence.persistDocument(updatedDocument)
                .then(result => this.saveCompleted())
                .catch(error => this.failureEncountered(error)),
            );

            this.props.onSetObjectives(unified.objectives);
          };

          this.services.displayModal(
            <ConfirmModal
              className="confirm-delete-modal"
              onCancel={() => this.services.dismissModal()}
              onConfirm={() => {
                confirmDelete();
                this.services.dismissModal();
              }}
              confirmLabel="Remove"
              confirmClass="btn-remove">
              Are you sure you want to remove objective '{obj.title}'?
              This action cannot be undone.
            </ConfirmModal>);
        }

      });

  }

  onToggleExpanded(guid) {
    const { overrideExpanded } = this.state;

    // if overrideExpanded is enabled, disable toggle expanded
    if (overrideExpanded) return;

    let action = null;
    if (this.props.expanded.has('objectives')) {
      action = this.props.expanded.get('objectives').has(guid)
        ? collapseNodes
        : expandNodes;
    } else {
      action = expandNodes;
    }

    this.props.dispatch(action('objectives', [guid]));
  }

  onBeginExternalEdit(model: contentTypes.LearningObjective) {

    const onEdit = (content) => {
      this.props.dismissModal();

      const updated = model.with({ rawContent: Maybe.just(content) });
      this.onObjectiveEdit(updated);
    };

    const onCancel = () => {
      this.props.dismissModal();
    };

    model.rawContent.lift((r) => {
      this.props.displayModal(
        <RawContentEditor
          rawContent={r}
          onEdit={onEdit} onCancel={onCancel} />,
      );
    });

  }

  // Filter resources shown based on title and id
  filterBySearchText(searchText: string): void {
    const { skills } = this.props;
    const text = searchText.trim().toLowerCase();

    const filterFn = (o: contentTypes.LearningObjective): boolean =>
      o.title.toLowerCase().includes(text)
      || o.skills.toArray().reduce(
        (acc, s) => acc || (skills.has(s) && skills.get(s).title.toLowerCase().includes(text)),
        false,
      );

    // searchText state is used for highlighting matches, and resources state creates
    // one row in the table for each resource present
    this.setState({
      searchText,
      filteredObjectives: searchText === ''
        ? Maybe.nothing<Immutable.OrderedMap<string, contentTypes.LearningObjective>>()
        : Maybe.just(this.state.objectives.objectives.filter(filterFn).toOrderedMap()),
      overrideExpanded: searchText === '' ? false : true,
    });
  }

  renderObjectives() {
    const { onPushRoute, selectedOrganization } = this.props;
    const {
      overrideExpanded, searchText, skillQuestionRefs, workbookPageRefs,
      organizationResourceMap,
    } = this.state;

    return selectedOrganization.caseOf({
      just: (organization) => {
        const rows = [];

        const isExpanded = (guid) => {
          if (overrideExpanded) return true;

          if (this.props.expanded.has('objectives')) {
            const set = this.props.expanded.get('objectives');
            return set.includes(guid);
          }

          return false;
        };

        const objectives = this.state.filteredObjectives.caseOf({
          just: fos => fos,
          nothing: () => this.state.objectives.objectives,
        });

        objectives
          .toArray()
          .forEach((objective: contentTypes.LearningObjective) => {

            rows.push(
              <Objective
                key={objective.id}
                course={this.props.course}
                onAddExistingSkill={this.onAddExistingSkill}
                onRemove={obj => this.removeObjective(obj)}
                onRemoveSkill={skill => this.removeSkill(objective, skill)}
                onAddNewSkill={this.onAddNewSkill}
                onBeginExternalEdit={this.onBeginExternalEdit}
                onPushRoute={onPushRoute}
                skillQuestionRefs={skillQuestionRefs}
                workbookPageRefs={workbookPageRefs}
                organizationResourceMap={organizationResourceMap}
                objective={objective}
                organization={organization}
                highlightText={searchText}
                skills={objective.skills.filter(string => this.props.skills.has(string))
                  .map(string => this.props.skills.get(string)).toList()}
                isExpanded={isExpanded(objective.id)}
                onToggleExpanded={this.onToggleExpanded}
                editMode={this.state.aggregateModel.isLocked && !this.state.isSavePending}
                onEdit={this.onObjectiveEdit}
                onEditSkill={this.onSkillEdit}
                loading={this.state.loading} />,
            );
          });

        return rows;
      },
      nothing: () => undefined,
    });
  }

  createNew(title: string) {
    const id = guid();
    const obj = new contentTypes.LearningObjective().with({
      id,
      title,
      guid: id,
    });
    const objectives = (this.state.objectives.newBucket.model as models.LearningObjectivesModel)
      .objectives.set(obj.id, obj);

    const model =
      (this.state.objectives.newBucket.model as models.LearningObjectivesModel)
        .with({ objectives });

    const document = this.state.objectives.newBucket.with({ model });

    const unified = Object.assign({}, this.state.objectives);

    const index = unified.documents.indexOf(unified.newBucket);

    unified.documents[index] = document;
    unified.objectives = unified.objectives.set(obj.id, obj);

    // The key step is to remap all newly created objective ids
    // to the updated newBucket document
    const idsToDocument = unified.mapping
      .filter((doc, id) => doc._id === this.state.objectives.newBucket._id)
      .map((doc, id) => document)
      .toOrderedMap()
      .set(id, document);

    unified.mapping = unified.mapping.merge(idsToDocument);

    unified.newBucket = document;

    this.setState({ objectives: unified });

    this.props.onUpdateObjectives(Immutable.OrderedMap(
      [[obj.get('id'), obj]]));

    persistence.persistDocument(document);
  }

  renderContent() {
    return (
      <div className="objectives-list">
        {this.renderObjectives()}
      </div>
    );
  }

  renderCreation() {
    const { course } = this.props;

    const editable =
      this.state.aggregateModel === null
        ? false
        : course.editable && this.state.aggregateModel.isLocked && !this.state.isSavePending;

    return (
      <div className="table-toolbar">
        <SearchBar
          className="inlineSearch"
          placeholder="Search by Objective or Skill"
          onChange={searchText => this.filterBySearchText(searchText)} />
        <div className="input-group">
          <div className="flex-spacer" />
          <DuplicateListingInput
            editMode={editable}
            buttonLabel="Create"
            width={400}
            value=""
            placeholder="New Learning Objective"
            existing={this.state.objectives === null ? Immutable.List<string>()
              : this.state.objectives.objectives.toList().map(o => o.title).toList()}
            onClick={this.createNew} />
        </div>
      </div>
    );
  }

  renderFilterbar() {
    const { course, selectedOrganization } = this.props;

    return selectedOrganization.caseOf({
      just: org => (
        <div className="filter-bar table-toolbar">
          <div className="selected-org-info">
            Metrics shown are based on the selected organization: <a href={
              `#${org.guid}-${course.guid}-${org.guid}`}>
              {org.title}
            </a>
            <div className="flex-spacer" />
          </div>
        </div>
      ),
      nothing: () => undefined,
    });
  }

  renderTitle() {
    const src = 'https://www.youtube.com/embed/14O7XCgsznY';

    return (
      <h2>Learning Objectives and Skills&nbsp;
        <HelpPopover activateOnClick>
          <iframe src={src} height={500} width={'100%'} />
        </HelpPopover>
      </h2>
    );
  }

  render() {

    const content = this.state.aggregateModel === null
      ? (
        <div className="page-loading">
          <LoadingSpinner message="Loading Objectives..." />
        </div>
      )
      : this.renderContent();

    return (
      <div className="objective-skill-view container-fluid new">
        <div className="row">
          <div className="col-sm-12 col-md-12 document">
            <div className="container-fluid editor">
              <div className="row">
                <div className="col-12">
                  {this.renderTitle()}
                  {this.renderCreation()}
                  {this.renderFilterbar()}
                  {content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default ObjectiveSkillView;
