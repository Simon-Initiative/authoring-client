import * as React from 'react';
import { Map, OrderedMap, List } from 'immutable';
import { Maybe } from 'tsmonad';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from 'data/persistence';
import { LegacyTypes } from 'data/types';
import * as models from 'data/models';
import { flattenChildren } from 'data/models/utils/org';
import { resourceId } from 'types/edge';
import {
  QuestionRef, getQuestionRefFromPathInfo, getReadableTitleFromType,
} from 'types/questionRef';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import colors from 'styles/colors';
import { disableSelect, ellipsizeOverflow, link } from 'styles/mixins';
import { extractFullText } from 'data/content/objectives/objective';

export type OrgItem =  contentTypes.Sequence
  | contentTypes.Unit
  | contentTypes.Module
  | contentTypes.Section;

type SkillRef = {
  id: string,
  title: string,
  questions: List<QuestionRef>,
};

type ObjectiveRef = {
  id: string,
  title: string,
  rawContent: Maybe<Object[]>,
  skills: List<SkillRef>,
};

const styles: JSSStyles = {
  ModuleAnalytics: {
    // camelCase styles
  },
  objectivesList: {
    marginTop: 10,
    marginBottom: 30,
    background: colors.white,
    padding: [0, 20],
    border: [1, 'solid', '#ddd'],
    borderRadius: 2,
  },
  objectiveRef: {
    extend: [disableSelect],
    borderBottom: [1, 'solid', colors.grayLight],

    '&:last-child': {
      borderBottom: 'none',
    },
  },
  objectiveTitle: {
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
  objectiveTitleText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 100,
    flex: 1,
    marginLeft: 10,
  },
  objectiveDetails: {
    margin: [0, 20, 20, 20],
  },
  skill: {

  },
  skillQuestions: {
    marginLeft: 20,
  },
  question: {
    extend: [ellipsizeOverflow],
    marginTop: 5,
  },
  questionLink: {
    extend: [link],
  },
};

export interface ModuleAnalyticsProps {
  course: models.CourseModel;
  model: OrgItem;
  objectives: OrderedMap<string, contentTypes.LearningObjective>;
  skills: OrderedMap<string, contentTypes.Skill>;
  organization: models.OrganizationModel;
  onPushRoute: (path: string) => void;
}

export interface ModuleAnalyticsState {
  objectiveRefs: Maybe<List<ObjectiveRef>>;
  organizationResourceMap: Maybe<Map<string, List<string>>>;
  hoveredObjectives: Map<string, boolean>;
  expandedObjectives: Map<string, boolean>;
}

/**
 * ModuleAnalytics React Component
 */
class ModuleAnalytics
    extends React.PureComponent<StyledComponentProps<ModuleAnalyticsProps, typeof styles>,
    ModuleAnalyticsState> {

  constructor(props) {
    super(props);

    this.state = this.getDefaultState();
  }

  componentWillMount() {
    this.fetchResources();
  }

  componentWillUpdate(
    nextProps: Readonly<ModuleAnalyticsProps>, nextState: Readonly<ModuleAnalyticsState>) {
    // this assumes that aggregateModel, skills, objectives are all set together
    if (nextProps.model !== null
      && nextProps.model !== this.props.model) {
      this.fetchResources();
    }
  }

  getDefaultState = () => {
    return {
      objectiveRefs: Maybe.nothing<List<ObjectiveRef>>(),
      organizationResourceMap: Maybe.nothing<Map<string, List<string>>>(),
      hoveredObjectives: Map<string, boolean>(),
      expandedObjectives: Map<string, boolean>(),
    };
  }

  async fetchResources() {
    const { model, course, objectives, skills, organization } = this.props;

    const orgResources = organization.getFlattenedResources();

    // get all page and assesment items in org item
    const ids = flattenChildren(model.children)
      .map(id => course.resourcesById.get(id))
      .reduce((acc, resource) => {
        switch (resource.type) {
          case LegacyTypes.workbook_page:
          case LegacyTypes.assessment2:
            return acc.push(resource.id);
          default:
            return acc;
        }
      }, List<string>()).toArray();

    // get all edges from org item refs
    const sourceEdges = await persistence.fetchEdgesByIds(
      course.guid, {}, { sourceIds: ids });

    // fetch skill edges for all items
    const allIds = ids.concat(
      sourceEdges
        .filter(e => e.destinationType === LegacyTypes.inline
          || e.destinationType === LegacyTypes.assessment2
          || e.destinationType === LegacyTypes.assessment2_pool
          || e.destinationType === LegacyTypes.workbook_page,
        )
        .map(e => resourceId(e.destinationId)));

    const skillEdges = await persistence.fetchEdgesByIds(
      course.guid, { destinationType: LegacyTypes.skill }, { sourceIds: allIds });

    // using skill edges, create a Map<SkillId, List<QuestionRef>>
    const skillQuestionRefMap = skillEdges.reduce(
      (acc, edge) => getQuestionRefFromPathInfo(
        edge.metadata.jsonObject.pathInfo,
        edge.sourceType,
        resourceId(edge.sourceId),
      ).caseOf({
        just: ref => acc.set(
          resourceId(edge.destinationId),
          (acc.get(resourceId(edge.destinationId)) || OrderedMap<string, QuestionRef>())
          .set(ref.key, ref),
        ),
        nothing: () => acc,
      }), Map<string, OrderedMap<string, QuestionRef>>(),
    );

    // create objectives List<ObjectiveRef>. We must re-fetch edges using all ids because
    // workbook pages linked by other workbook pages might have learning objectives as well
    const objectiveEdges = await persistence.fetchEdgesByIds(
      course.guid, { destinationType: LegacyTypes.learning_objective }, { sourceIds: allIds });

    const objectiveRefs: List<ObjectiveRef> = objectiveEdges.reduce(
      (acc, objEdge) => Maybe.maybe(objectives.get(resourceId(objEdge.destinationId)))
        .caseOf({
          just: objective => acc.push({
            id: objective.id,
            title: objective.title,
            rawContent: objective.rawContent,
            skills: objective.skills.reduce(
              (acc, skillId) => Maybe.maybe(skillQuestionRefMap.get(skillId))
                .caseOf({
                  just: questionRefs => acc.push({
                    id: skillId,
                    title: Maybe.maybe(skills.get(skillId))
                      .caseOf({
                        just: skill => skill.title,
                        nothing: () => '[skill not found]',
                      }),
                    questions: questionRefs.toList(),
                  }),
                  nothing: () => acc,
                }),
              List<SkillRef>(),
            ),
          }),
          nothing: () => acc,
        }),
      List<ObjectiveRef>(),
    );

    this.setState({
      objectiveRefs: Maybe.just(objectiveRefs),
    });
  }

  onEnterObjective = (id: string) => {
    const { hoveredObjectives } = this.state;
    this.setState({ hoveredObjectives: hoveredObjectives.set(id, true) });
  }

  onLeaveObjective = (id: string) => {
    const { hoveredObjectives } = this.state;
    this.setState({ hoveredObjectives: hoveredObjectives.set(id, false) });
  }

  onToggleObjectiveDetails = (id: string) => {
    const { expandedObjectives } = this.state;
    this.setState({
      expandedObjectives: expandedObjectives.set(id, !expandedObjectives.get(id)),
    });
  }

  renderObjectiveDetails(objectiveRef: ObjectiveRef, organization: models.OrganizationModel) {
    const { classes, course, onPushRoute } = this.props;

    return (
      <div className={classes.objectiveDetails}>
        {objectiveRef.skills.map(skill => (
          <div key={skill.id} className={classes.skill}>
            <i className="fa fa-cubes" /> <b>Skill:</b> {skill.title}
            <div className={classes.skillQuestions}>
              {skill.questions.map(question => (
                <div key={question.key} className={classes.question}>
                  <i className="far fa-question-circle" /> <span className={classes.questionLink}
                    onClick={() => onPushRoute(
                      `/${course.resourcesById.get(question.assessmentId).guid}-${course.guid}`
                      + `-${organization.guid}`
                      + `?questionId=${question.id}`)}>
                    {question.title.valueOr(getReadableTitleFromType(question.type))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderAggregateObjectiveDetails(objectiveRef: ObjectiveRef) {
    return (
      <div></div>
    );
  }

  renderObjectiveRef(objectiveRef: ObjectiveRef, organization: models.OrganizationModel) {
    const { classes } = this.props;
    const { expandedObjectives } = this.state;

    const displayedTitle = objectiveRef
      .rawContent.caseOf({ just: c => extractFullText(c), nothing: () => objectiveRef.title });

    const isExpanded = expandedObjectives.get(objectiveRef.id);

    return (
      <div
        key={objectiveRef.id}
        className={classes.objectiveRef}
        onMouseEnter={() => this.onEnterObjective(objectiveRef.id)}
        onMouseLeave={() => this.onLeaveObjective(objectiveRef.id)}>
        <div
          className={classNames([classes.objectiveTitle])}
          onClick={() => this.onToggleObjectiveDetails(objectiveRef.id)}>
          <div><i className="fa fa-graduation-cap" /></div>
          <div className={classNames([classes.objectiveTitleText])}>
            <div className="flex-spacer">
              {displayedTitle}
            </div>
            <div>
              {!isExpanded  && this.renderAggregateObjectiveDetails(objectiveRef)}
            </div>
          </div>
        </div>
        {isExpanded && this.renderObjectiveDetails(objectiveRef, organization)}
      </div>
    );
  }

  render() {
    const { className, classes, model, organization } = this.props;
    const { objectiveRefs } = this.state;

    return (
      <div className={classNames(['ModuleAnalytics', classes.ModuleAnalytics, className])}>
        {objectiveRefs.caseOf({
          just: refs => refs.size > 0
            ? (
              <div className={classes.objectivesList}>
                {refs.map(ref => this.renderObjectiveRef(ref, organization))}
              </div>
            )
            : (
              <div>
                This {model.contentType} doesn't contain any objectives.
                <br />
                Analytics are driven by workbook page objectives and must be added
                before this data can be displayed.
              </div>
            ),
          nothing: () => (
            <LoadingSpinner message="Loading Analytics..." />
          ),
        })}
      </div>
    );
  }
}

const StyledModuleAnalytics = withStyles<ModuleAnalyticsProps>(styles)(ModuleAnalytics);
export { StyledModuleAnalytics as ModuleAnalytics };
