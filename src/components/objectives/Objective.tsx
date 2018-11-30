import * as React from 'react';
import { List, Map } from 'immutable';
import { Maybe } from 'tsmonad';
import * as contentTypes from '../../data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { extractFullText } from 'data/content/objectives/objective';
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
import history from 'utils/history';
import { Tooltip } from 'utils/tooltip';

const PAGE_COUNT_WARNING_THRESHOLD = 1;
const SKILL_COUNT_WARNING_THRESHOLD = 3;
const FORMATIVE_COUNT_WARNING_THRESHOLD = 1;
const SUMMATIVE_COUNT_WARNING_THRESHOLD = 1;

const WarningTip = ({ show, children }) =>
  show ? (
    <Tooltip
      html={children}
      interactive={true}
      theme="light"
      size="small"
      arrowSize="small">
      <i className={classNames(['fa fa-exclamation-circle'])}
        style={{ color: colors.danger, margin: '0px 4px' }} />
    </Tooltip>
  )
  : null;

const SKILL_GRID_HEADER_HEIGHT = 180;

const addPluralS = (string: string, itemCount: number) =>
  itemCount === 1 ? string : `${string}s`;

const getReadableTitleFromType = (type: string) => {
  switch (type) {
    case 'essay':
      return 'Essay';
    case 'short_answer':
      return 'Short Answer';
    case 'fill_in_the_blank':
      return 'Fill in the Blank';
    case 'image_hotspot':
      return 'Image Hotspot';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'numeric':
      return 'Numeric';
    case 'ordering':
      return 'Ordering';
    case 'question':
    default:
      return 'Question';
  }
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
    minWidth: 0,
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
  skillBadge: {
    marginRight: 8,
    lineHeight: 'inherit',
    border: [1, 'solid', colors.grayLight],
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
  skill: {
    display: 'flex',
    flexDirection: 'row',
    padding: 4,
    borderBottom: [1, 'solid', colors.grayLighter],
    height: 35,
    overflow: 'hidden',

    '&:nth-child(even)': {
      backgroundColor: '#F7FBFF',
    },

    '&:last-child': {
      borderBottom: 'none',
    },

    '&:hover $skillActions': {
      display: 'block',
    },
  },
  skillBadges: {
    whiteSpace: 'nowrap',
  },
  skillCountBadgeIcon: {
    width: 14,
  },
  skillTitle: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexFlow: 'row nowrap',
  },
  skillActions: {
    display: 'none',
    margin: [0, 20],
  },
  skillActionButton: {
    lineHeight: 1,
    padding: 0,
    marginLeft: 20,
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

export interface QuestionRef {
  id: string;
  title: Maybe<string>;
  type: string;
  assessmentType: LegacyTypes;
  assessmentId: string;
}

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
    const { course, objective, skillQuestionRefs } = this.props;

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

  getFormativeAssessmentCount = () => {
    const { skills, skillFormativeRefs } = this.props;

    return skillFormativeRefs.caseOf({
      just: refMap => skills.reduce(
        (acc, skill) => refMap.has(skill.id) ? acc + refMap.get(skill.id).size : acc,
        0,
      ),
      nothing: () => null,
    });

  }

  getSummativeAssessmentCount = () => {
    const { skills, skillSummativeRefs } = this.props;

    return skillSummativeRefs.caseOf({
      just: refMap => skills.reduce(
        (acc, skill) => refMap.has(skill.id) ? acc + refMap.get(skill.id).size : acc,
        0,
      ),
      nothing: () => null,
    });
  }

  getQuestionPoolAssessmentCount = () => {
    const { skills, skillPoolRefs } = this.props;

    return skillPoolRefs.caseOf({
      just: refMap => skills.reduce(
        (acc, skill) => refMap.has(skill.id) ? acc + refMap.get(skill.id).size : acc,
        0,
      ),
      nothing: () => null,
    });
  }

  getOrderedObjectiveQuestions = () => {
    const { course, skills, skillQuestionRefs } = this.props;

    // because we are reducing on an ordered list of skills, the result
    // will automatically be sorted by skill which is what we want
    const questionRefs: List<QuestionRef> = skills.reduce(
      (acc, skill) => acc
        .concat(skillQuestionRefs
          .valueOr(Map<string, List<QuestionRef>>())
          .get(skill.id))
        .toList(),
      List<QuestionRef>(),
    )
    // filter out undefined refs
    .filter(ref => !!ref)
    // dedupe refs
    .reduce((acc, ref) => acc.find(r => r.id === ref.id) ? acc : acc.push(ref), List<QuestionRef>())
    // filter out undefined refs
    .toList();

    return questionRefs.toArray();
  }

  getOrderedObjectiveAssessments = () => {
    const { course, skills, skillFormativeRefs, skillSummativeRefs, skillPoolRefs } = this.props;

    // because we are reducing on an ordered list of skills, the result
    // will automatically be sorted by skill which is what we want
    const assessmentIdRefs: List<string> = skills.reduce(
      (acc, skill) => acc
        .concat(skillFormativeRefs
          .valueOr(Map<string, List<string>>())
          .get(skill.id))
        .concat(skillSummativeRefs
          .valueOr(Map<string, List<string>>())
          .get(skill.id))
        .concat(skillPoolRefs
          .valueOr(Map<string, List<string>>())
          .get(skill.id))
        .toList(),
      List<string>(),
    )
    // filter out undefined refs
    .filter(ref => !!ref)
    // dedupe refs
    .reduce((acc, ref) => acc.contains(ref) ? acc : acc.push(ref), List<string>())
    .toList();

    return assessmentIdRefs.map(ref => course.resourcesById.get(ref)).toArray();
  }

  renderSkillGridHeader() {
    const { classes, course } = this.props;

    const LEFT_OFFSET = 20;
    const diagonalDist = (height: number) => Math.sqrt(2 * (height * height));
    const orderedObjectiveQuestionRefs = this.getOrderedObjectiveQuestions();

    return orderedObjectiveQuestionRefs.length > 0
      ? (
        <div className={classes.skillGridHeader}>
          <div className="flex-spacer"/>
          <div style={{ height: SKILL_GRID_HEADER_HEIGHT }}>
            <svg width="100%" height={SKILL_GRID_HEADER_HEIGHT}>
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
                  <g key={question.id}
                    transform={`translate(${LEFT_OFFSET + (35 * i)}, `
                      + `${SKILL_GRID_HEADER_HEIGHT}) rotate(-45)`}>
                    <text
                      className={classes.assessmentLink}
                      transform="translate(10, 2)"
                      onClick={() => history.push(
                        `/${course.resourcesById.get(question.assessmentId).guid}-${course.guid}`)}>
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

    const orderedObjectiveQuestions = this.getOrderedObjectiveQuestions();

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
                      <div key={question.id} className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-flask',
                          classes.formativeColor, classes.gridAssessmentIcon])} />
                      </div>
                    </Tooltip>
                  )
                : skillContainsSummativeQuestion(skill, question)
                  ? (
                    <Tooltip title="Summative" distance={15}
                      size="small" arrowSize="small">
                      <div key={question.id} className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-check',
                          classes.summativeColor, classes.gridAssessmentIcon])} />
                      </div>
                    </Tooltip>
                  )
                : skillContainsPoolQuestion(skill, question)
                  ? (
                    <Tooltip title="Question Pool" distance={15}
                      size="small" arrowSize="small">
                      <div key={question.id} className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-shopping-basket',
                          classes.poolColor, classes.gridAssessmentIcon])} />
                      </div>
                    </Tooltip>
                  )
                : (
                  <div key={question.id} className={classes.skillGridCell}/>
                )
              ))}
            </div>
          ))}
        </div>
      )
      : null;
  }

  renderSkillActions(skill: contentTypes.Skill) {
    const { classes, editMode, loading } = this.props;
    const { skillEdits } = this.state;

    return (
      <React.Fragment>
        <Button
          className={classNames([classes.skillActionButton])}
          editMode={editMode && !loading}
          type="link"
          onClick={() => this.setState({
            skillEdits: skillEdits.set(skill.guid, true),
          })}>
          Rename
        </Button>
        <Button
          className={classNames([classes.skillActionButton, 'btn-remove'])}
          editMode={editMode && !loading}
          type="link"
          onClick={() => this.onSkillRemove(skill)}>
          Remove
        </Button>
      </React.Fragment>
    );
  }

  renderSkillBadges(skill: contentTypes.Skill) {
    const { classes, skillFormativeRefs, skillSummativeRefs, skillPoolRefs } = this.props;

    const formativeCount = skillFormativeRefs.caseOf({
      just: refMap => refMap.has(skill.id) ? refMap.get(skill.id).size : 0,
      nothing: () => null,
    });

    const summativeCount = skillSummativeRefs.caseOf({
      just: refMap => refMap.has(skill.id) ? refMap.get(skill.id).size : 0,
      nothing: () => null,
    });

    const poolCount = skillPoolRefs.caseOf({
      just: refMap => refMap.has(skill.id) ? refMap.get(skill.id).size : 0,
      nothing: () => null,
    });

    const formativeTooltip = <div style={{ textAlign: 'left' }}>
      <b><i className="fa fa-flask" /> Formative Questions</b>
      <br/>
      This is the number of low stakes, practice questions that are associated with this skill
    </div>;
    const summativeTooltip = <div style={{ textAlign: 'left' }}>
      <b><i className="fa fa-check" /> Summative Questions</b>
      <br/>
      This is the number of high stakes questions that are associated with this skill
    </div>;
    const poolTooltip = <div style={{ textAlign: 'left' }}>
      <b><i className="fa fa-shopping-basket" /> Pool Questions</b>
      <br/>
      This is the number of pool questions that are associated with this skill
    </div>;

    const notEnoughFormativesWarning = formativeCount < FORMATIVE_COUNT_WARNING_THRESHOLD
      ? (
        <span>
          at least {FORMATIVE_COUNT_WARNING_THRESHOLD} formative
        </span>
      )
      : null;

    const notEnoughSummativesWarning = summativeCount < SUMMATIVE_COUNT_WARNING_THRESHOLD
      ? (
        <span>
          at least {SUMMATIVE_COUNT_WARNING_THRESHOLD} summative
        </span>
      )
      : null;

    return (
        <div className={classes.skillBadges}>
          <WarningTip
            show={notEnoughFormativesWarning || notEnoughSummativesWarning}>
            <div>
              Skills should have {notEnoughFormativesWarning}
              {notEnoughFormativesWarning && notEnoughSummativesWarning && ' and '}
              {notEnoughSummativesWarning} {addPluralS('assessment', Math.max(
                FORMATIVE_COUNT_WARNING_THRESHOLD,
                SUMMATIVE_COUNT_WARNING_THRESHOLD,
              ))}
              <br/>
              <a href="#">Learn more about skills</a>.
            </div>
          </WarningTip>
          <Tooltip html={formativeTooltip} distance={10}
            size="small" arrowSize="small">
            <span className={classNames(['badge badge-light', classes.skillBadge])}
              style={{
                color: flatui.nephritis,
                borderRight: 'none',
                marginRight: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}>
              {formativeCount} <i className={classNames([
                'fa fa-flask', classes.skillCountBadgeIcon])}/>
            </span>
          </Tooltip>
          <Tooltip html={summativeTooltip} distance={10}
            size="small" arrowSize="small">
            <span
              className={classNames(['badge badge-light', classes.skillBadge])}
              style={{
                color: flatui.amethyst,
                borderRight: 'none',
                marginLeft: 0,
                marginRight: 0,
                borderRadius: 0,
              }}>
              {summativeCount} <i className={classNames([
                'fa fa-check', classes.skillCountBadgeIcon])}/>
            </span>
          </Tooltip>
          <Tooltip html={poolTooltip} distance={10}
            size="small" arrowSize="small">
            <span
              className={classNames(['badge badge-light', classes.skillBadge])}
              style={{
                color: flatui.turquoise,
                marginLeft: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}>
              {poolCount} <i className={classNames([
                'fa fa-shopping-basket', classes.skillCountBadgeIcon])}/>
            </span>
          </Tooltip>
        </div>
    );
  }

  renderSkills() {
    const {
      classes, skills, editMode, loading, onEditSkill, highlightText,
    } = this.props;
    const { skillEdits } = this.state;

    return skills.map(skill => (
      <div key={skill.guid} className={classes.skill}>
        {this.renderSkillBadges(skill)}
        <div className={classes.skillTitle}>
          <InlineEdit
            inputStyle={{ width: '80%' }}
            highlightText={highlightText}
            isEditing={skillEdits.get(skill.guid)}
            onEdit={(value) => {
              this.setState({
                skillEdits: skillEdits.set(skill.guid, false),
              });
              onEditSkill(skill.with({ title: value }));
            }}
            onCancel={() => this.setState({
              skillEdits: skillEdits.set(skill.guid, false),
            })}
            editMode={editMode && !loading}
            value={skill.title} />
        </div>
        {!skillEdits.get(skill.guid) &&
          <div className={classes.skillActions}>
            {this.renderSkillActions(skill)}
          </div>
        }
      </div>
    ));
  }

  renderDetails() {
    const {
      classes, course, editMode, objective, loading, onAddNewSkill, onAddExistingSkill,
      skills,
    } = this.props;
    const { workbookPageRefs } = this.state;

    const pageCount = workbookPageRefs.caseOf({
      just: refs => refs.size,
      nothing: () => null,
    });

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

    const orderedObjectiveAssessments = this.getOrderedObjectiveQuestions();

    const RIGHT_QUAD_WIDTH = (orderedObjectiveAssessments.length * 35)
      + (SKILL_GRID_HEADER_HEIGHT);

    return (
      <div className={classes.detailsQuad}>
        <div className={classes.quadTop}>
          <div className={classes.quadLeft}>
            <div className={classes.pageSection}>
              <h3>
              <WarningTip show={pageCount < PAGE_COUNT_WARNING_THRESHOLD}>
                Objectives should be referenced by at least {PAGE_COUNT_WARNING_THRESHOLD}
                {' workbook ' + addPluralS('page', PAGE_COUNT_WARNING_THRESHOLD)}.
              </WarningTip>
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
                  <i className="fa fa-circle-o-notch fa-spin fa-fw"/> Loading...
                </div>
                ),
              })}
            </div>
            <div className={classes.skillSection}>
              <h3>
                <WarningTip show={skills.size < SKILL_COUNT_WARNING_THRESHOLD}>
                  Objectives should have at least {SKILL_COUNT_WARNING_THRESHOLD}
                  {' ' + addPluralS('skill', SKILL_COUNT_WARNING_THRESHOLD)}.
                  <br/>
                  <a href="#">Learn more about skills</a>.
                </WarningTip>
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
                <div className="flex-spacer"/>
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
    const { classes, skills } = this.props;
    const { workbookPageRefs } = this.state;

    const pageCount = workbookPageRefs.caseOf({
      just: refs => refs.size,
      nothing: () => null,
    });

    const skillCount = skills.size;
    const formativeCount = this.getFormativeAssessmentCount();
    const summativeCount = this.getSummativeAssessmentCount();
    const poolCount = this.getQuestionPoolAssessmentCount();

    return (
      <React.Fragment>
        <span
          className={classNames(['badge badge-light', classes.detailBadge])}
          style={{ marginLeft: 0 }}>
          <WarningTip show={pageCount < PAGE_COUNT_WARNING_THRESHOLD}>
            Objectives should be referenced by at least {PAGE_COUNT_WARNING_THRESHOLD}
            {' workbook ' + addPluralS('page', PAGE_COUNT_WARNING_THRESHOLD)}.
          </WarningTip>
          {pageCount} {addPluralS('Page', pageCount)}
        </span>
        <span className={classNames(['badge badge-light', classes.detailBadge])}>
          <WarningTip show={skillCount < SKILL_COUNT_WARNING_THRESHOLD}>
            Objectives should have at least {SKILL_COUNT_WARNING_THRESHOLD}
            {' ' + addPluralS('skill', SKILL_COUNT_WARNING_THRESHOLD)}.
            <br/>
            <a href="#">Learn more about skills</a>.
          </WarningTip>
          {skillCount} {addPluralS('Skill', skillCount)}
          <span
            className={classes.detailsOverviewAssessmentCounts} >
            <span
              className={classNames([classes.detailsOverviewSeparator, classes.formativeColor])}>
              {`${formativeCount} `}
              <i className="fa fa-flask"/>
              </span>
            <span
              className={classNames([classes.detailsOverviewSeparator, classes.summativeColor])}>
              {`${summativeCount} `}
              <i className="fa fa-check"/>
              </span>
            <span
              className={classNames([classes.detailsOverviewSeparator, classes.poolColor])}>
              {`${poolCount} `}
              <i className="fa fa-shopping-basket"/>
            </span>
          </span>
        </span>
      </React.Fragment>
    );
  }

  render() : JSX.Element {
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
          <div className="flex-spacer"/>
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
          <div><i className="fa fa-graduation-cap"/></div>
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

