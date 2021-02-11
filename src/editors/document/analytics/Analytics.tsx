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
import { dedupeArray } from 'utils/utils';
import { AnalyticsState as ReduxAnalyticsState } from 'reducers/analytics';
import { ContentElements } from 'data/content/common/elements';
import { InlineEntities } from 'data/content/learning/contiguous';
import { map } from 'data/utils/map';
import { DatasetStatus } from 'types/analytics/dataset';
import { PartAnalytics } from './PartAnalytics';

const getOrderedParts = (body: ContentElements, parts: List<contentTypes.Part>) => {
  return body.content.reduce(
    (acc, contentElement) => {
      let updatedAcc = acc;
      map((ce) => {
        if (ce.contentType === 'ContiguousText') {
          (ce as contentTypes.ContiguousText).getEntitiesByType(InlineEntities.InputRef)
            .forEach(entityInfo => updatedAcc = updatedAcc.push(
              entityInfo.data.get('value').input));
        }
        return ce;
      }, contentElement);

      return updatedAcc;
    },
    List<any>(),
  )
    .map(input => parts.find(p => p.responses.every(r => r.input === input)))
    .filter(part => !!part);
};

export type OrgItem = contentTypes.Sequence
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
  Analytics: {
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
    marginBottom: 20,
  },
  skillQuestions: {
    marginTop: 6,
    marginLeft: 20,
  },
  question: {
    padding: 4,
    border: [1, 'solid', colors.grayLighter],
    borderBottom: 'none',

    '&:nth-child(even)': {
      backgroundColor: '#F7FBFF',
    },

    '&:last-child': {
      borderBottom: [1, 'solid', colors.grayLighter],
    },
  },
  questionTitle: {
    display: 'flex',
    flexDirection: 'row',

    '& i': {
      marginTop: 4,
      marginRight: 2,
    },
  },
  partIcon: {
    margin: 4,
  },
  partTitle: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    marginLeft: 40,
  },
  questionLabel: {
    marginRight: [6, '!important'],
    fontWeight: 600,
  },
  questionLink: {
    extend: [ellipsizeOverflow, link],
    display: 'inline',
    flex: 1,
  },
  questionStats: {
    display: 'flex',
    flexDirection: 'row',
  },
  noStats: {
    color: colors.grayDark,
    margin: [2, 10],
    fontSize: 14,
  },
};

export interface AnalyticsProps {
  course: models.CourseModel;
  model: OrgItem;
  analytics: ReduxAnalyticsState;
  objectives: OrderedMap<string, contentTypes.LearningObjective>;
  skills: OrderedMap<string, contentTypes.Skill>;
  organization: models.OrganizationModel;
  onPushRoute: (path: string) => void;
}

export interface AnalyticsState {
  objectiveRefs: Maybe<List<ObjectiveRef>>;
  organizationResourceMap: Maybe<Map<string, List<string>>>;
  hoveredObjectives: Map<string, boolean>;
  expandedObjectives: Map<string, boolean>;
}

/**
 * Analytics React Component
 */
class Analytics
  extends React.Component<StyledComponentProps<AnalyticsProps, typeof styles>,
  AnalyticsState> {

  constructor(props) {
    super(props);

    this.state = this.getDefaultState();
  }

  componentWillMount() {
    this.fetchResources(this.props);
  }

  componentWillReceiveProps(
    nextProps: Readonly<AnalyticsProps>, nextState: Readonly<AnalyticsState>) {
    // this assumes that aggregateModel, skills, objectives are all set together
    if (nextProps.model !== null
      && nextProps.model.id !== this.props.model.id) {
      this.fetchResources(nextProps);
      this.setState(this.getDefaultState());
    }
  }

  shouldComponentUpdate(nextProps: Readonly<StyledComponentProps<AnalyticsProps, JSSStyles>>,
    nextState: Readonly<AnalyticsState>) {
    return nextState !== this.state ||
      nextProps.course.idvers !== this.props.course.idvers ||
      nextProps.model.id !== this.props.model.id ||
      nextProps.analytics !== this.props.analytics ||
      nextProps.objectives !== this.props.objectives ||
      nextProps.skills !== this.props.skills ||
      nextProps.organization.id !== this.props.organization.id;
  }

  getDefaultState = () => {
    return {
      objectiveRefs: Maybe.nothing<List<ObjectiveRef>>(),
      organizationResourceMap: Maybe.nothing<Map<string, List<string>>>(),
      hoveredObjectives: Map<string, boolean>(),
      expandedObjectives: Map<string, boolean>(),
    };
  }

  async fetchResources(nextProps: AnalyticsProps) {
    const { model, course, objectives, skills, organization } = nextProps;

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

    // fetch skill edges for all items, then dedupe ids
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
        edge.metadata.pathInfo,
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

    const objectiveRefs: List<ObjectiveRef> =
      dedupeArray(objectiveEdges, e => resourceId(e.destinationId)).reduce(
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
      )
        // filter out objectives with no skills
        .filter(objective => objective.skills.size > 0)
        .toList();

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

  renderNoAnalyticsMsg(item: string = 'item') {
    const { classes } = this.props;

    return (
      <div className={classes.questionStats}>
        <span className={classes.noStats}>Analytics are unavailable for this {item}</span>
      </div>
    );
  }

  renderMultipleParts(
    question: QuestionRef, skill: SkillRef, organization: models.OrganizationModel) {
    const { classes, course, analytics, onPushRoute } = this.props;

    const parts = getOrderedParts(question.body(), question.parts())
      // get ordered index of part, because we will filter out parts without this skill
      .map((part, index) => ({
        index,
        id: part.id,
        guid: part.guid,
        skills: part.skills,
      }))
      // only include parts that pertain to this skill
      .filter(part => part.skills.contains(skill.id));

    return parts.map(part => (
      <div key={part.guid} className={classes.partTitle}>
        <i className={classNames([classes.partIcon, 'fa fa-marker'])} />
        <div className={classes.questionLink}
          onClick={() => onPushRoute(
            `/${course.idvers.value()}/${question.assessmentId}`
            + `?organization=${organization.resource.id}`
            + `&questionId=${question.id}`
            + `&partId=${part.id}`)}>
          Part {part.index + 1}
        </div>
        {analytics.dataSet.bind(analyticsDataSet => analyticsDataSet.byResourcePart
          .lift(byResourcePart => analyticsDataSet.status === DatasetStatus.DONE
            && byResourcePart.getIn([question.assessmentId, part.id])))
          .caseOf({
            just: partAnalytics => <PartAnalytics partAnalytics={partAnalytics} />,
            nothing: () => this.renderNoAnalyticsMsg(),
          })}
      </div>
    ));
  }

  renderQuestion(question: QuestionRef, skill: SkillRef, organization: models.OrganizationModel) {
    const { classes, course, analytics, onPushRoute } = this.props;
    const parts = question.parts();
    return (
      <div key={question.key} className={classes.question}>
        <div key={question.key} className={classes.questionTitle}>
          <span className={classes.questionLabel}>{question.label}:</span>
          <div className={classes.questionLink}
            onClick={() => onPushRoute(
              `/${course.idvers.value()}/${question.assessmentId}`
              + `?organization=${organization.resource.id}`
              + `&questionId=${question.id}`)}>
            {question.title.valueOr(getReadableTitleFromType(question.type))}
          </div>
          {parts.size === 1 && (
            Maybe.maybe(parts.first())
              .bind(part => analytics.dataSet
                .bind(analyticsDataset => analyticsDataset.byResourcePart
                  .lift(byResourcePart => byResourcePart.getIn([question.assessmentId, part.id]))))
              .caseOf({
                just: partAnalytics => <PartAnalytics partAnalytics={partAnalytics} />,
                nothing: () => this.renderNoAnalyticsMsg(),
              }))}
        </div>
        {parts.size > 1 && this.renderMultipleParts(question, skill, organization)}
      </div>
    );
  }

  renderObjectiveDetails(objectiveRef: ObjectiveRef, organization: models.OrganizationModel) {
    const { classes } = this.props;

    return (
      <div className={classes.objectiveDetails}>
        {objectiveRef.skills.map(skill => (
          <div key={skill.id} className={classes.skill}>
            <i className="fa fa-cube" /> <b>Skill:</b> {skill.title}
            <div className={classes.skillQuestions}>
              {skill.questions.map(question => this.renderQuestion(question, skill, organization))}
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
              {!isExpanded && this.renderAggregateObjectiveDetails(objectiveRef)}
            </div>
          </div>
        </div>
        {isExpanded && this.renderObjectiveDetails(objectiveRef, organization)}
      </div >
    );
  }

  render() {
    const { className, classes, model, organization } = this.props;
    const { objectiveRefs } = this.state;

    return (
      <div className={classNames(['Analytics', classes.Analytics, className])}>
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

const StyledAnalytics = withStyles<AnalyticsProps>(styles)(Analytics);
export { StyledAnalytics as Analytics };
