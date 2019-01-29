import * as React from 'react';
import { List, Map } from 'immutable';
import { Maybe } from 'tsmonad';
import * as contentTypes from '../../data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { extractFullText, LearningObjective } from 'data/content/objectives/objective';
import { Button } from 'components/common/Button';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';
import * as persistence from 'data/persistence';
import { LegacyTypes } from 'data/types';
import { InlineEdit } from './InlineEdit';
import { CourseModel } from 'data/models';
import { stringFormat } from 'utils/format';
import flatui from 'styles/palettes/flatui';
import { Tooltip } from 'utils/tooltip';
import { Skill, skillModelRules } from 'components/objectives/Skill';
import { IssueTooltip } from 'components/objectives/IssueTooltip';
import { addPluralS, getReadableTitleFromType, QuestionRef } from 'components/objectives/utils';
import { checkModel, ModelCheckerRule, RequirementType } from 'data/linter/modelChecker';

export interface RuleData {
  pageCount: number;
  skills: List<contentTypes.Skill>;
  skillQuestionRefs: Maybe<Map<string, List<QuestionRef>>>;
}

enum Issue {
  AT_LEAST_3_SKILLS = 'AT_LEAST_3_SKILLS',
  AT_LEAST_1_PAGE = 'AT_LEAST_1_PAGE',
  SKILLS_HAVE_3_OF_EACH = 'SKILLS_HAVE_3_OF_EACH',
}

export const objectiveModelRules: ModelCheckerRule<LearningObjective, RuleData>[] = [{
  id: Issue.AT_LEAST_3_SKILLS,
  name: 'Objective',
  requirementType: RequirementType.Should,
  requirement: 'have at least 3 skills',
  isIssue: (data: LearningObjective, aux) =>
    data.skills.size < 3,
}, {
  id: Issue.AT_LEAST_1_PAGE,
  name: 'Objective',
  requirementType: RequirementType.Should,
  requirement: 'be referenced by at least 1 workbook page',
  isIssue: (data: LearningObjective, aux) => {
    const { pageCount } = aux;
    return pageCount < 1;
  },
}, {
  id: Issue.SKILLS_HAVE_3_OF_EACH,
  name: 'Objective',
  requirementType: RequirementType.Should,
  requirement: 'have valid skills',
  isIssue: (data: LearningObjective, aux) => {
    const { skills, skillQuestionRefs } = aux;
    return skills.reduce(
      (acc, skill) => {
        // const skill = skills.find(s => s.id === skillId);
        const refs = getOrderedObjectiveQuestions(skills, skillQuestionRefs, skill);
        const formativeCount = refs
          .filter(r => r.assessmentType === LegacyTypes.inline)
          .length;
        const summativeCount = refs
          .filter(r => r.assessmentType === LegacyTypes.assessment2)
          .length;

        const checkModelResults = checkModel(
          skill,
          skillModelRules,
          { formativeCount, summativeCount });

        return acc || checkModelResults.issues.size > 0;
      },
      false,
    );
  },
}];

const SKILL_GRID_HEADER_HEIGHT = 180;

export const SKILLS_HELP_LINK = '//olihelp.freshdesk.com/support/solutions/articles/32000023904'
  + '-what-are-learning-objectives-and-skills-';

const getOrderedObjectiveQuestions = (
  skills, skillQuestionRefs, skill?: contentTypes.Skill,
) => {

  // because we are reducing on an ordered list of skills, the result
  // will automatically be sorted by skill which is what we want
  const questionRefs: List<QuestionRef> = skill
    ? skillQuestionRefs
      .valueOr(Map<string, List<QuestionRef>>())
      .get(skill.id) || List<QuestionRef>()
    : skills.reduce(
      (acc, skill) => acc
        .concat(skillQuestionRefs
          .valueOr(Map<string, List<QuestionRef>>())
          .get(skill.id))
        .toList(),
      List<QuestionRef>(),
    )
      // filter out undefined refs
      .filter(ref => !!ref)
      // // dedupe refs
      .reduce(
        (acc, ref) => acc.find(r => r.key === ref.key)
          ? acc
          : acc.push(ref),
        List<QuestionRef>(),
      )
      // filter out undefined refs
      .toList();

  return questionRefs.toArray();
};

export const styles: JSSStyles = {
  Objective: {
    extend: [disableSelect],

    borderBottom: [1, 'solid', colors.grayLight],

    '&:last-child': {
      borderBottom: 'none',
    },
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '1.2em',
    minHeight: 50,
    padding: [10, 0],
    cursor: 'pointer',

    '&:hover': {
      color: colors.primary,
    },
  },
  expandDisable: {
    cursor: 'inherit',

    '&:hover': {
      color: 'inherit',
    },
  },
  titleText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 100,
    flex: 1,
    marginLeft: 10,
  },
  detailsQuad: {
    marginLeft: 20,
    paddingBottom: 20,
    overflowX: 'auto',

    '& h3': {
      display: 'flex',
      flexDirection: 'row',
      fontSize: '1em',
      fontWeight: 600,
      marginTop: 10,
    },
  },
  quadTop: {
    display: 'flex',
    flexDirection: 'row',
  },
  quadBottom: {
    display: 'flex',
    flexDirection: 'row',
  },
  quadLeft: {
    flex: 1,
    minWidth: 400,
  },
  quadRight: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageSection: {
    minHeight: 120,
  },
  skillSection: {
    '& h1': {
      display: 'flex',
      flexDirection: 'row',
    },
  },
  skillGridHeader: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  skillGrid: {
    margin: [0, 20, 20, 0],
    borderLeft: 'none',
  },
  skillGridRow: {
    height: 35,
    borderTop: [1, 'solid', colors.grayLighter],
    marginRight: (SKILL_GRID_HEADER_HEIGHT - 20),
    whiteSpace: 'nowrap',

    '&:nth-child(even)': {
      backgroundColor: '#F7FBFF',
    },

    '&:last-child': {
      borderBottom: [1, 'solid', colors.grayLighter],
      height: 37,
    },
  },
  skillGridCell: {
    display: 'inline-block',
    padding: 4,
    borderRight: [1, 'solid', colors.grayLighter],
    width: 35,
    textAlign: 'center',
    height: 35,
    position: 'relative',
  },
  gridAssessmentIcon: {
    position: 'absolute',
    top: 9,
    left: 9,
  },
  formativeColor: {
    color: flatui.nephritis,
  },
  summativeColor: {
    color: flatui.amethyst,
  },
  poolColor: {
    color: flatui.turquoise,
  },
  detailsOverviewSeparator: {
    padding: [0, 6],
    borderLeft: [1, 'solid', colors.grayLight],
  },
  detailsOverviewAssessmentCounts: {
    borderRadius: 4,
    marginLeft: 10,
    fontWeight: 600,
  },
  detailsSectionIcon: {
    marginRight: 5,
    width: 26,
    textAlign: 'center',
  },
  detailBadge: {
    marginLeft: 5,
    fontWeight: 400,
    backgroundColor: colors.grayLighter,
  },
  countBadge: {
    margin: [0, 8],
    backgroundColor: colors.grayLighter,
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'row',
    height: 30,
    marginLeft: 50,
    minWidth: 200,

    '& > *': {
      marginLeft: 10,
    },
  },
  pageList: {
    margin: [10, 0, 20, 20],
  },
  pageTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexFlow: 'row nowrap',
  },
  skillList: {
    margin: [0, 0, 20, 20],
    border: [1, 'solid', colors.grayLighter],
  },
  noPagesMsg: {
    color: colors.grayDark,
    margin: [20, 0, 20, 20],
  },
  noSkillsMsg: {
    color: colors.grayDark,
    margin: [20, 0, 20, 20],
  },
  addSkillButton: {
    lineHeight: 1,
    padding: 0,
    marginLeft: 20,
  },
  assessmentLink: {
    fill: colors.primary,
    cursor: 'pointer',

    '&:hover': {
      fill: colors.hover,
      textDecoration: 'underline',
    },
  },
  loading: {
    color: colors.gray,
    margin: 20,
  },
};

export interface ObjectiveProps {
  course: CourseModel;
  isExpanded: boolean;
  editMode: boolean;
  objective: contentTypes.LearningObjective;
  skills: List<contentTypes.Skill>;
  loading: boolean;
  skillFormativeRefs: Maybe<Map<string, List<string>>>;
  skillSummativeRefs: Maybe<Map<string, List<string>>>;
  skillPoolRefs: Maybe<Map<string, List<string>>>;
  skillQuestionRefs: Maybe<Map<string, List<QuestionRef>>>;
  highlightText?: string;
  onToggleExpanded: (id) => void;
  onEdit: (model: contentTypes.LearningObjective) => void;
  onEditSkill: (model: contentTypes.Skill) => void;
  onAddNewSkill: (model: contentTypes.LearningObjective) => void;
  onAddExistingSkill: (model: contentTypes.LearningObjective) => void;
  onBeginExternalEdit: (model: contentTypes.LearningObjective) => void;
  onRemove: (model: contentTypes.LearningObjective) => void;
  onRemoveSkill: (model: contentTypes.Skill) => void;
  onPushRoute: (path: string) => void;
}

export interface ObjectiveState {
  mouseOver: boolean;
  skillEdits: Map<string, boolean>;
  workbookPageRefs: Maybe<List<string>>;
  hasRequestedRefs: boolean;
  isEditingTitle: boolean;
}

@injectSheet(styles)
export class Objective
  extends React.PureComponent<StyledComponentProps<ObjectiveProps>, ObjectiveState> {

  constructor(props) {
    super(props);

    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onObjectiveRemove = this.onObjectiveRemove.bind(this);
    this.onSkillRemove = this.onSkillRemove.bind(this);

    this.state = {
      mouseOver: false,
      skillEdits: Map<string, boolean>(),
      workbookPageRefs: Maybe.nothing<List<string>>(),
      hasRequestedRefs: false,
      isEditingTitle: false,
    };
  }

  componentDidMount() {
    this.loadReferences();
  }

  componentWillReceiveProps(nextProps: ObjectiveProps) {
    const { hasRequestedRefs } = this.state;

    if (nextProps.isExpanded && !hasRequestedRefs) {
      this.loadReferences();
    }
  }

  loadReferences = () => {
    const { course, objective } = this.props;

    this.setState({
      hasRequestedRefs: true,
    });

    // fetch all workbookpage edges to build workbookpage refs list
    persistence.fetchEdges(course.guid, {
      sourceType: LegacyTypes.workbook_page,
      destinationType: LegacyTypes.learning_objective,
      destinationId: objective.id,
    }).then((edges) => {
      this.setState({
        workbookPageRefs: Maybe.just(edges.reduce(
          (acc, edge) => acc.push(edge.sourceId.split(':')[2]),
          List<string>()),
        ),
      });
    });
  }

  onToggleDetails = () => {
    const { objective, isExpanded, onToggleExpanded } = this.props;
    const { hasRequestedRefs } = this.state;

    if (!isExpanded && !hasRequestedRefs) {
      this.loadReferences();
    }

    onToggleExpanded(objective.id);
  }

  onEnter() {
    this.setState({ mouseOver: true });
  }

  onLeave() {
    this.setState({ mouseOver: false });
  }

  onObjectiveRemove(model: contentTypes.LearningObjective) {
    this.props.onRemove(model);
  }

  onSkillRemove(model: contentTypes.Skill) {
    this.props.onRemoveSkill(model);
  }

  renderSkillGridHeader() {
    const { classes, course, onPushRoute, skills, skillQuestionRefs } = this.props;

    const LEFT_OFFSET = 20;
    const diagonalDist = (height: number) => Math.sqrt(2 * (height * height));
    const orderedObjectiveQuestionRefs = getOrderedObjectiveQuestions(skills, skillQuestionRefs);

    return orderedObjectiveQuestionRefs.length > 0
      ? (
        <div className={classes.skillGridHeader}>
          <div className="flex-spacer" />
          <div style={{ height: SKILL_GRID_HEADER_HEIGHT }}>
            <svg
              width={(35 * orderedObjectiveQuestionRefs.length) + SKILL_GRID_HEADER_HEIGHT}
              height={SKILL_GRID_HEADER_HEIGHT}>
              <g transform={`translate(-15, ${SKILL_GRID_HEADER_HEIGHT}) rotate(-45)`}>
                <line
                  x1={10}
                  y1={10}
                  x2={diagonalDist(SKILL_GRID_HEADER_HEIGHT)}
                  y2={10}
                  stroke={colors.grayLighter} />
              </g>
              <g transform={`translate(${SKILL_GRID_HEADER_HEIGHT - 8}, 7)`}>
                <line
                  x1={0}
                  y1={0}
                  x2={35 * orderedObjectiveQuestionRefs.length}
                  y2={0}
                  stroke={colors.grayLighter} />
              </g>
              {orderedObjectiveQuestionRefs
                .map((question, i) => (
                  <g key={question.key}
                    transform={`translate(${LEFT_OFFSET + (35 * i)}, `
                      + `${SKILL_GRID_HEADER_HEIGHT}) rotate(-45)`}>
                    <text
                      className={classes.assessmentLink}
                      transform="translate(10, 2)"
                      onClick={() => onPushRoute(
                        `/${course.resourcesById.get(question.assessmentId).guid}-${course.guid}`
                        + `?questionId=${question.id}`)}>
                      {stringFormat.ellipsizePx(
                        question.title.valueOr(
                          getReadableTitleFromType(question.type)),
                        diagonalDist(SKILL_GRID_HEADER_HEIGHT) - 120, 'Open Sans', 16)}
                    </text>
                    <line
                      x1={10}
                      y1={10}
                      x2={diagonalDist(SKILL_GRID_HEADER_HEIGHT)}
                      y2={10}
                      stroke={colors.grayLighter} />
                  </g>
                ))}
            </svg>
          </div>
        </div>
      )
      : null;
  }

  renderSkillGrid() {
    const {
      classes, skills, skillQuestionRefs,
    } = this.props;

    const orderedObjectiveQuestions = getOrderedObjectiveQuestions(skills, skillQuestionRefs);

    const skillContainsFormativeQuestion = (
      skill: contentTypes.Skill, question: QuestionRef) =>
      skillQuestionRefs.caseOf({
        just: questionRefs => questionRefs.has(skill.id)
          && !!questionRefs.get(skill.id)
            .find(r => r.id === question.id && r.assessmentType === LegacyTypes.inline),
        nothing: () => false,
      });

    const skillContainsSummativeQuestion = (
      skill: contentTypes.Skill, question: QuestionRef) =>
      skillQuestionRefs.caseOf({
        just: questionRefs => questionRefs.has(skill.id)
          && !!questionRefs.get(skill.id)
            .find(r => r.id === question.id && r.assessmentType === LegacyTypes.assessment2),
        nothing: () => false,
      });

    const skillContainsPoolQuestion = (
      skill: contentTypes.Skill, question: QuestionRef) =>
      skillQuestionRefs.caseOf({
        just: questionRefs => questionRefs.has(skill.id)
          && !!questionRefs.get(skill.id)
            .find(r => r.id === question.id && r.assessmentType === LegacyTypes.assessment2_pool),
        nothing: () => false,
      });

    return orderedObjectiveQuestions.length > 0
      ? (
        <div className={classes.skillGrid}>
          {skills.toArray().map((skill, i) => (
            <div key={skill.guid} className={classes.skillGridRow}>
              {orderedObjectiveQuestions.map((question: QuestionRef, j) => (
                skillContainsFormativeQuestion(skill, question)
                  ? (
                    <Tooltip title="Formative" distance={15}
                      size="small" arrowSize="small">
                      <div
                        key={question.key}
                        className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-flask',
                          classes.formativeColor, classes.gridAssessmentIcon])} />
                      </div>
                    </Tooltip>
                  )
                  : skillContainsSummativeQuestion(skill, question)
                    ? (
                      <Tooltip title="Summative" distance={15}
                        size="small" arrowSize="small">
                        <div key={question.key} className={classes.skillGridCell}>
                          <i className={classNames(['fa fa-check',
                            classes.summativeColor, classes.gridAssessmentIcon])} />
                        </div>
                      </Tooltip>
                    )
                    : skillContainsPoolQuestion(skill, question)
                      ? (
                        <Tooltip title="Question Pool" distance={15}
                          size="small" arrowSize="small">
                          <div key={question.key} className={classes.skillGridCell}>
                            <i className={classNames(['fa fa-shopping-basket',
                              classes.poolColor, classes.gridAssessmentIcon])} />
                          </div>
                        </Tooltip>
                      )
                      : (
                        <div key={question.key} className={classes.skillGridCell} />
                      )
              ))}
            </div>
          ))}
        </div>
      )
      : null;
  }

  renderSkills() {
    const {
      skills, editMode, loading, onEditSkill, highlightText, skillQuestionRefs,
    } = this.props;
    const { skillEdits } = this.state;

    return skills.map(skill => (
      <Skill
        key={skill.guid}
        editMode={editMode}
        skill={skill}
        loading={loading}
        highlightText={highlightText}
        isEditing={skillEdits.get(skill.guid)}
        skillQuestionRefs={getOrderedObjectiveQuestions(skills, skillQuestionRefs, skill)}
        onEnterEditMode={() => this.setState({
          skillEdits: skillEdits.set(skill.guid, true),
        })}
        onExitEditMode={() => this.setState({
          skillEdits: skillEdits.set(skill.guid, false),
        })}
        onRemoveSkill={this.onSkillRemove}
        onEditSkill={onEditSkill} />
    ));
  }

  renderDetails() {
    const {
      classes, course, editMode, objective, loading, onAddNewSkill, onAddExistingSkill,
      skills, skillQuestionRefs,
    } = this.props;
    const { workbookPageRefs } = this.state;

    const pageCount = workbookPageRefs.caseOf({
      just: refs => refs.size,
      nothing: () => null,
    });

    const checkModelResults = checkModel(
      objective, objectiveModelRules, { pageCount, skills, skillQuestionRefs });

    const getRefGuidFromRefId = (id: string) =>
      Maybe.maybe(course.resourcesById.get(id)).caseOf({
        just: resource => resource.guid,
        nothing: () => '',
      });
    const getWBPTitleFromRefId = (id: string) =>
      Maybe.maybe(course.resourcesById.get(id)).caseOf({
        just: resource => resource.title,
        nothing: () => '[Error loading page title]',
      });

    const orderedObjectiveAssessments = getOrderedObjectiveQuestions(skills, skillQuestionRefs);

    const RIGHT_QUAD_WIDTH = (orderedObjectiveAssessments.length * 35)
      + (SKILL_GRID_HEADER_HEIGHT);

    return (
      <div className={classes.detailsQuad}>
        <div className={classes.quadTop}>
          <div className={classes.quadLeft}>
            <div className={classes.pageSection}>
              <h3>
                {checkModelResults.getIssue(Issue.AT_LEAST_1_PAGE).caseOf({
                  just: issue => (
                    <IssueTooltip>
                      {issue.description}
                    </IssueTooltip>
                  ),
                  nothing: () => undefined,
                })}
                <i className={classNames(['fa fa-file-o', classes.detailsSectionIcon])} />
                Pages
              {workbookPageRefs.caseOf({
                  just: refs => (
                    <span className={classNames(['badge badge-light', classes.countBadge])}>
                      {refs.size}
                    </span>
                  ),
                  nothing: () => null,
                })}
              </h3>
              {workbookPageRefs.caseOf({
                just: (refs) => {
                  return refs.size > 0
                    ? (
                      <div className={classes.pageList}>
                        {refs.map(refGuid => (
                          <div key={refGuid} className={classes.pageTitle}>
                            <a href={`./#${getRefGuidFromRefId(refGuid)}-${course.guid}`}>
                              <i className={classNames(['fa fa-file-o', classes.detailsSectionIcon])} />
                              {getWBPTitleFromRefId(refGuid)}
                            </a>
                          </div>
                        ))}
                      </div>
                    )
                    : (
                      <div className={classes.noPagesMsg}>
                        <span>This objective is not referenced by any workbook pages.</span>
                      </div>
                    );
                },
                nothing: () => (
                  <div className={classes.loading}>
                    <i className="fa fa-circle-o-notch fa-spin fa-fw" /> Loading...
                </div>
                ),
              })}
            </div>
            <div className={classes.skillSection}>
              <h3>
                {checkModelResults.getIssue(Issue.AT_LEAST_3_SKILLS).caseOf({
                  just: issue => (
                    <IssueTooltip>
                      {issue.description}
                      <br />
                      <a href={SKILLS_HELP_LINK} target="_blank">Learn more about skills</a>.
                    </IssueTooltip>
                  ),
                  nothing: () => undefined,
                })}
                <i className={classNames(['fa fa-cubes', classes.detailsSectionIcon])} />
                Skills
                <span className={classNames(['badge badge-light', classes.countBadge])}>
                  {skills.size}
                </span>
                <Button
                  className={classes.addSkillButton}
                  editMode={editMode && !loading}
                  type="link"
                  onClick={() => onAddExistingSkill(objective)}>
                  Add Existing Skill
                </Button>
                <Button
                  className={classes.addSkillButton}
                  editMode={editMode && !loading}
                  type="link"
                  onClick={() => onAddNewSkill(objective)}>
                  Create New Skill
                </Button>
                <div className="flex-spacer" />
                {skills.size > 0 && orderedObjectiveAssessments.length < 1 &&
                  <div style={{ color: colors.gray, fontWeight: 400 }}>
                    These skills are not referenced by any assessments
                  </div>
                }
              </h3>
            </div>
          </div>
          <div className={classes.quadRight} style={{ width: RIGHT_QUAD_WIDTH }}>
            {this.renderSkillGridHeader()}
          </div>
        </div>
        <div className={classes.quadBottom}>
          <div className={classes.quadLeft}>
            {skills.size > 0
              ? (
                <div className={classes.skillList}>
                  {this.renderSkills()}
                </div>
              )
              : (
                <div className={classes.noSkillsMsg}>
                  <span>No skills are assigned to this objective. You should </span>
                  <Button
                    className={classNames([classes.addSkillButton])}
                    editMode={editMode && !loading}
                    type="inline-link"
                    onClick={() => onAddExistingSkill(objective)}>
                    add
                  </Button>
                  <span> or </span>
                  <Button
                    className={classNames([classes.addSkillButton])}
                    editMode={editMode && !loading}
                    type="inline-link"
                    onClick={() => onAddNewSkill(objective)}>
                    create
                  </Button>
                  <span> some.</span>
                </div>
              )
            }
          </div>
          <div className={classes.quadRight} style={{ width: RIGHT_QUAD_WIDTH }}>
            {this.renderSkillGrid()}
          </div>
        </div>
      </div>
    );
  }

  renderAggregateDetails() {
    const {
      classes, skills, skillQuestionRefs, objective,
    } = this.props;
    const { workbookPageRefs } = this.state;

    const pageCount = workbookPageRefs.caseOf({
      just: refs => refs.size,
      nothing: () => null,
    });
    const checkModelResults = checkModel(
      objective, objectiveModelRules,
      { pageCount, skills, skillQuestionRefs });
    const skillCount = skills.size;

    return (
      <React.Fragment>
        <span
          className={classNames(['badge badge-light', classes.detailBadge])}
          style={{ marginLeft: 0 }}>
          {checkModelResults.getIssue(Issue.AT_LEAST_1_PAGE).caseOf({
            just: issue => (
              <IssueTooltip>
                {issue.description}
              </IssueTooltip>
            ),
            nothing: () => undefined,
          })}
          {pageCount} {addPluralS('Page', pageCount)}
        </span>
        <span className={classNames(['badge badge-light', classes.detailBadge])}>
          {checkModelResults.getIssue(Issue.AT_LEAST_3_SKILLS).caseOf({
            just: issue => (
              <IssueTooltip>
                {issue.description}
                <br />
                <a href={SKILLS_HELP_LINK} target="_blank">Learn more about skills</a>.
              </IssueTooltip>
            ),
            nothing: () => checkModelResults.getIssue(Issue.SKILLS_HAVE_3_OF_EACH).caseOf({
              just: issue => (
                <IssueTooltip>
                  Skills have one or more issues. Expand to see details.
                </IssueTooltip>
              ),
              nothing: () => undefined,
            }),
          })}
          {skillCount} {addPluralS('Skill', skillCount)}
          {skillQuestionRefs.caseOf({
            just: (questionRefs) => {
              const orderedQuestionRefs = getOrderedObjectiveQuestions(skills, skillQuestionRefs);

              const formativeCount = orderedQuestionRefs
                .filter(r => r.assessmentType === LegacyTypes.inline)
                .length;

              const summativeCount = orderedQuestionRefs
                .filter(r => r.assessmentType === LegacyTypes.assessment2)
                .length;

              const poolCount = orderedQuestionRefs
                .filter(r => r.assessmentType === LegacyTypes.assessment2_pool)
                .length;

              return (
                <span
                  className={classes.detailsOverviewAssessmentCounts} >
                  <span
                    className={classNames([
                      classes.detailsOverviewSeparator, classes.formativeColor])}>
                    {`${formativeCount} `}
                    <i className="fa fa-flask" />
                  </span>
                  <span
                    className={classNames([
                      classes.detailsOverviewSeparator, classes.summativeColor])}>
                    {`${summativeCount} `}
                    <i className="fa fa-check" />
                  </span>
                  <span
                    className={classNames([
                      classes.detailsOverviewSeparator, classes.poolColor])}>
                    {`${poolCount} `}
                    <i className="fa fa-shopping-basket" />
                  </span>
                </span>
              );
            },
            nothing: () => null,
          })}
        </span>
      </React.Fragment>
    );
  }

  render(): JSX.Element {
    const {
      className, classes, editMode, objective, isExpanded, onEdit, loading, onRemove,
      onBeginExternalEdit, highlightText,
    } = this.props;
    const { mouseOver, isEditingTitle } = this.state;

    const requiresExternalEdit = objective
      .rawContent.caseOf({ just: c => true, nothing: () => false });

    const displayedTitle = objective
      .rawContent.caseOf({ just: c => extractFullText(c), nothing: () => objective.title });

    const actionButtons = mouseOver && editMode
      ? (
        <React.Fragment>
          <div className="flex-spacer" />
          <Button
            editMode={editMode && !loading}
            type="secondary"
            onClick={(e) => {
              if (requiresExternalEdit) {
                onBeginExternalEdit(objective);
              } else {
                this.setState({
                  isEditingTitle: true,
                });
              }
              e.stopPropagation();
            }}>
            Reword
          </Button>
          <Button
            editMode={editMode && !loading}
            type="secondary"
            className="btn-remove"
            onClick={(e) => {
              onRemove(objective);
              e.stopPropagation();
            }}>
            Remove
          </Button>
        </React.Fragment>
      )
      : null;

    return (
      <div
        className={classNames(['Objective', classes.Objective, className])}
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}>
        <div
          className={classNames([classes.title, highlightText !== '' && classes.expandDisable])}
          onClick={() => this.onToggleDetails()}>
          <div><i className="fa fa-graduation-cap" /></div>
          <div className={classNames([classes.titleText])}>
            <div className="flex-spacer">
              <InlineEdit
                inputStyle={{ width: '80%' }}
                highlightText={highlightText}
                isEditing={isEditingTitle}
                onEdit={(value) => {
                  this.setState({
                    isEditingTitle: false,
                  });
                  onEdit(objective.with({ title: value }));
                }}
                onCancel={() =>
                  this.setState({
                    isEditingTitle: false,
                  })}
                editMode={editMode && !loading}
                value={displayedTitle} />
            </div>
            <div>
              {!isExpanded && !isEditingTitle && this.renderAggregateDetails()}
            </div>
          </div>
          <div className={classes.actionButtons}>{actionButtons}</div>
        </div>
        {isExpanded && this.renderDetails()}
      </div>
    );

  }
}

