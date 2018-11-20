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

const SKILL_GRID_HEADER_HEIGHT = 180;

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
    padding: [10, 0, 20, 0],
    cursor: 'pointer',

    '&:hover': {
      color: colors.primary,
    },
  },
  titleText: {
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
  },
  quadRight: {
    display: 'flex',
    flexDirection: 'column',
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
    color: flatui.amethyst,
  },
  summativeColor: {
    color: flatui.nephritis,
  },
  poolColor: {
    color: flatui.greenSea,
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
    margin: [10, 0, 80, 20],
  },
  skillList: {
    margin: [0, 0, 20, 20],
    border: [1, 'solid', colors.grayLighter],
  },
  noPagesMsg: {
    color: colors.grayDark,
    margin: [20, 0, 80, 20],
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
  skillCountBadgeIcon: {
    width: 12,
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

type skillId = string;
type workbookPageId = string;
type formativeId = string;
type summativeId = string;
type poolId = string;

export interface ObjectiveProps {
  course: CourseModel;
  isExpanded: boolean;
  editMode: boolean;
  objective: contentTypes.LearningObjective;
  skills: List<contentTypes.Skill>;
  highlighted: boolean;
  loading: boolean;
  skillFormativeRefs: Maybe<Map<skillId, List<formativeId>>>;
  skillSummativeRefs: Maybe<Map<skillId, List<summativeId>>>;
  skillPoolRefs: Maybe<Map<skillId, List<poolId>>>;
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
  workbookPageRefs: Maybe<List<workbookPageId>>;
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
      workbookPageRefs: Maybe.nothing<List<workbookPageId>>(),
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
    const { course, objective, skills } = this.props;

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

  getOrderedObjectiveAssessments = () => {
    const { course, skills, skillFormativeRefs, skillSummativeRefs, skillPoolRefs } = this.props;

    // because we are reducing on an ordered list of skills, the result
    // will automatically be sorted by skill which is what we want
    const assessmentIdRefs: List<string> = skills.reduce(
      (acc, skill) => acc.concat(skillFormativeRefs
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
    ).filter(ref => !!ref).toList();

    return assessmentIdRefs.map(ref => course.resourcesById.get(ref)).toArray();
  }

  renderSkillGridHeader() {
    const { classes, course } = this.props;

    const LEFT_OFFSET = 20;
    const diagonalDist = (height: number) => Math.sqrt(2 * (height * height));
    const orderedObjectiveAssessments = this.getOrderedObjectiveAssessments();

    return orderedObjectiveAssessments.length > 0
      ? (
        <div className={classes.skillGridHeader}>
          <div className="flex-spacer"/>
          <div style={{ height: SKILL_GRID_HEADER_HEIGHT }}>
            <svg width="100%" height={SKILL_GRID_HEADER_HEIGHT} viewBox="0 0">
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
                  x2={35 * orderedObjectiveAssessments.length}
                  y2={0}
                  stroke={colors.grayLighter} />
              </g>
              {orderedObjectiveAssessments
                .map((assessment, i) => (
                  <g key={assessment.guid}
                    transform={`translate(${LEFT_OFFSET + (35 * i)}, `
                      + `${SKILL_GRID_HEADER_HEIGHT}) rotate(-45)`}>
                    <text
                      className={classes.assessmentLink}
                      transform="translate(10, 2)"
                      onClick={() => history.push(`/${assessment.guid}-${course.guid}`)}>
                      {stringFormat.ellipsize(assessment.title, 24)}
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
    const { classes, skills, skillFormativeRefs , skillSummativeRefs, skillPoolRefs } = this.props;

    const orderedObjectiveAssessments = this.getOrderedObjectiveAssessments();

    const skillContainsFormative = (skill: contentTypes.Skill, formative: contentTypes.Resource) =>
      skillFormativeRefs.valueOr(Map<string, List<string>>()).has(skill.id)
      && skillFormativeRefs.valueOr(Map<string, List<string>>()).get(skill.id)
        .contains(formative.id);

    const skillContainsSummative = (skill: contentTypes.Skill, summative: contentTypes.Resource) =>
    skillSummativeRefs.valueOr(Map<string, List<string>>()).has(skill.id)
      && skillSummativeRefs.valueOr(Map<string, List<string>>()).get(skill.id)
        .contains(summative.id);

    const skillContainsPool = (skill: contentTypes.Skill, summative: contentTypes.Resource) =>
    skillPoolRefs.valueOr(Map<string, List<string>>()).has(skill.id)
      && skillPoolRefs.valueOr(Map<string, List<string>>()).get(skill.id)
        .contains(summative.id);

    return orderedObjectiveAssessments.length > 0
      ? (
        <div className={classes.skillGrid}>
          {skills.toArray().map((skill, i) => (
            <div key={skill.guid} className={classes.skillGridRow}>
              {orderedObjectiveAssessments.map((assessment, j) => (
                skillContainsFormative(skill, assessment)
                  ? (
                    <Tooltip title="Formative" distance={15}
                      size="small" arrowSize="small">
                      <div key={assessment.guid} className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-flask',
                          classes.formativeColor, classes.gridAssessmentIcon])} />
                      </div>
                    </Tooltip>
                  )
                : skillContainsSummative(skill, assessment)
                  ? (
                    <Tooltip title="Summative" distance={15}
                      size="small" arrowSize="small">
                      <div key={assessment.guid} className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-check',
                          classes.summativeColor, classes.gridAssessmentIcon])} />
                      </div>
                    </Tooltip>
                  )
                : skillContainsPool(skill, assessment)
                  ? (
                    <Tooltip title="Question Pool" distance={15}
                      size="small" arrowSize="small">
                      <div key={assessment.guid} className={classes.skillGridCell}>
                        <i className={classNames(['fa fa-question',
                          classes.poolColor, classes.gridAssessmentIcon])}
                          style={{ left: 11 }} />
                      </div>
                    </Tooltip>
                  )
                : (
                  <div key={assessment.guid} className={classes.skillGridCell}/>
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

    const tooltipTitle = <div style={{ textAlign: 'left' }}>
      {formativeCount} <i className="fa fa-flask" /> Formative
      <br/>
      {summativeCount} <i className="fa fa-check" /> Summative
      <br/>
      {poolCount} <i className="fa fa-question" /> Question Pools
    </div>;

    return (
      <Tooltip html={tooltipTitle} distance={10}
        size="small" arrowSize="small">
        <span className={classNames(['badge badge-light', classes.skillBadge])}
          style={{
            color: flatui.amethyst,
            borderRight: 'none',
            marginRight: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}>
          {formativeCount} <i className={classNames(['fa fa-flask', classes.skillCountBadgeIcon])}/>
        </span>
        <span
          className={classNames(['badge badge-light', classes.skillBadge])}
          style={{
            color: flatui.nephritis,
            borderRight: 'none',
            marginLeft: 0,
            marginRight: 0,
            borderRadius: 0,
          }}>
          {summativeCount} <i className={classNames(['fa fa-check', classes.skillCountBadgeIcon])}/>
        </span>
        <span
          className={classNames(['badge badge-light', classes.skillBadge])}
          style={{
            color: flatui.greenSea,
            marginLeft: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}>
          {poolCount} <i className={classNames(['fa fa-question', classes.skillCountBadgeIcon])}/>
        </span>
      </Tooltip>
    );
  }

  renderSkills() {
    const {
      classes, skills, editMode, loading, onEditSkill,
    } = this.props;
    const { skillEdits } = this.state;

    return skills.map(skill => (
      <div key={skill.guid} className={classes.skill}>
        {this.renderSkillBadges(skill)}
        <InlineEdit
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
        <div className="flex-spacer" />
        <div className={classes.skillActions}>
          {!skillEdits.get(skill.guid) && this.renderSkillActions(skill)}
        </div>
      </div>
    ));
  }

  renderDetails() {
    const {
      classes, course, editMode, objective, loading, onAddNewSkill, onAddExistingSkill,
      skills,
    } = this.props;
    const { workbookPageRefs } = this.state;

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

    const REF_LIMIT = 10;
    const RIGHT_QUAD_WIDTH = (this.getOrderedObjectiveAssessments().length * 35)
      + (SKILL_GRID_HEADER_HEIGHT);

    return (
      <div className={classes.detailsQuad}>
        <div className={classes.quadTop}>
          <div className={classes.quadLeft}>
            <h3>
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
                    {refs.slice(0, REF_LIMIT).map(refGuid => (
                      <div key={refGuid}>
                        <a href={`./#${getRefGuidFromRefId(refGuid)}-${course.guid}`}>
                        <i className={classNames(['fa fa-file-o', classes.detailsSectionIcon])} />
                        {stringFormat.ellipsize(getWBPTitleFromRefId(refGuid), 100, 5)}
                        </a>
                      </div>
                    ))}
                    {refs.size > REF_LIMIT
                      ? (
                        <div>and {refs.size - REF_LIMIT} more...</div>
                      )
                      : null
                    }
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
            <h3>
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
            </h3>
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

  renderDetailOverview() {
    const { classes, skills, skillFormativeRefs, skillSummativeRefs } = this.props;
    const { workbookPageRefs } = this.state;

    const pageCount = workbookPageRefs.caseOf({
      just: refs => (
        <span
          className={classNames(['badge badge-light', classes.detailBadge])}
          style={{ marginLeft: 20 }}>
          {refs.size} Pages
        </span>
      ),
      nothing: () => null,
    });

    const formativeCount = skillFormativeRefs.caseOf({
      just: refMap => (
        <span className={classNames(['badge badge-light', classes.detailBadge])}>
          {skills.reduce(
            (acc, skill) => refMap.has(skill.id) ? acc + refMap.get(skill.id).size : acc,
            0,
          )} Formative
        </span>
      ),
      nothing: () => null,
    });

    const summativeCount = skillSummativeRefs.caseOf({
      just: refMap => (
        <span className={classNames(['badge badge-light', classes.detailBadge])}>
        {skills.reduce(
          (acc, skill) => refMap.has(skill.id) ? acc + refMap.get(skill.id).size : acc,
          0,
        )} Summative
        </span>
      ),
      nothing: () => null,
    });

    return (
      <React.Fragment>
        {pageCount}
        {formativeCount}
        {summativeCount}
      </React.Fragment>
    );
  }

  render() : JSX.Element {
    const {
      className, classes, editMode, objective, isExpanded, onEdit, loading, onRemove,
      onBeginExternalEdit,
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
          className={classNames([classes.title])}
          onClick={() => this.onToggleDetails()}>
          <div><i className="fa fa-graduation-cap"/></div>
          <div className={classNames([classes.titleText])}>
            <InlineEdit
              inputStyle={{ width: '80%' }}
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
              {!isExpanded && !isEditingTitle && this.renderDetailOverview()}
          </div>
          <div className={classes.actionButtons}>{actionButtons}</div>
        </div>
        {isExpanded && this.renderDetails()}
      </div>
    );

  }
}

