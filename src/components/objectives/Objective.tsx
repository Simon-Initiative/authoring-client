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
  titleText: {
    minWidth: 100,
    flex: 1,
    marginLeft: 10,
  },
  details: {
    marginLeft: 20,
    paddingBottom: 10,

    '& h3': {
      display: 'flex',
      flexDirection: 'row',
      fontSize: '1em',
      fontWeight: 600,
      marginTop: 10,
    },
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
    margin: [10, 20],
  },
  skillList: {
    margin: [10, 20],
    border: [1, 'solid', colors.grayLighter],
  },
  noItemsMsg: {
    color: colors.grayDark,
    margin: 20,
  },
  skill: {
    display: 'flex',
    flexDirection: 'row',
    padding: 4,
    borderBottom: [1, 'solid', colors.grayLighter],

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
  highlighted: boolean;
  loading: boolean;
  skillFormativeRefs: Maybe<Map<skillId, List<formativeId>>>;
  skillSummativeRefs: Maybe<Map<skillId, List<summativeId>>>;
  onToggleExpanded: (id) => void;
  onEdit: (model: contentTypes.LearningObjective) => void;
  onEditSkill: (model: contentTypes.Skill) => void;
  onAddNewSkill: (model: contentTypes.LearningObjective) => void;
  onAddExistingSkill: (model: contentTypes.LearningObjective) => void;
  onBeginExternalEdit: (model: contentTypes.LearningObjective) => void;
  onRemove: (model: contentTypes.LearningObjective) => void;
  onRemoveSkill: (model: contentTypes.Skill) => void;
}

type skillId = string;
type workbookPageId = string;
type formativeId = string;
type summativeId = string;

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
    const { isExpanded } = this.props;

    // if (isExpanded) {
    //   this.loadReferences();
    // }

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
    const { classes, skillFormativeRefs, skillSummativeRefs } = this.props;

    const formativeCount = skillFormativeRefs.caseOf({
      just: refMap => (
        <span className={classNames(['badge badge-light', classes.skillBadge])}
          style={{
            color: flatui.amethyst,
            borderRight: 'none',
            marginRight: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}>
          {refMap.has(skill.id) ? refMap.get(skill.id).size : 0} <i className="fa fa-flask"/>
        </span>
      ),
      nothing: () => null,
    });

    const summativeCount = skillSummativeRefs.caseOf({
      just: refMap => (
        <span
          className={classNames(['badge badge-light', classes.skillBadge])}
          style={{
            color: flatui.nephritis,
            marginLeft: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}>
          {refMap.has(skill.id) ? refMap.get(skill.id).size : 0} <i className="fa fa-check" />
        </span>
      ),
      nothing: () => null,
    });

    return (
      <React.Fragment>
        {formativeCount}
        {summativeCount}
      </React.Fragment>
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

    return (
      <div className={classes.details}>
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
                    {' ' + stringFormat.ellipsize(getWBPTitleFromRefId(refGuid), 100, 5)}
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
              <div className={classes.noItemsMsg}>
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
          {skills.size > 0
            ? (
              <div className={classes.skillList}>
                {this.renderSkills()}
              </div>
            )
            : (
              <div className={classes.noItemsMsg}>
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

