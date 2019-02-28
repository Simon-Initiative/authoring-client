import * as React from 'react';
import { Map } from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import flatui from 'styles/palettes/flatui';
import * as contentTypes from '../../data/contentTypes';
import { InlineEdit } from './InlineEdit';
import { Button } from 'components/common/Button';
import { IssueTooltip } from 'components/objectives/IssueTooltip';
import { Tooltip } from 'utils/tooltip';
import { QuestionRef, calculateGuaranteedSummativeCount } from 'components/objectives/utils';
import { LegacyTypes } from 'data/types';
import {
  checkModel, ModelCheckerRule, RequirementType,
} from 'data/linter/modelChecker';

export interface ModelRuleData {
  formativeCount: number;
  summativeCount: number;
}

enum Issue {
  AT_LEAST_3_FORMATIVE = 'AT_LEAST_3_FORMATIVES',
  AT_LEAST_3_SUMMATIVE = 'AT_LEAST_3_SUMMATIVE',
}

export const skillModelRules: ModelCheckerRule<contentTypes.Skill, ModelRuleData>[] = [{
  id: Issue.AT_LEAST_3_FORMATIVE,
  name: 'Skill',
  requirementType: RequirementType.Should,
  requirement: 'have at least 3 formative questions',
  isIssue: (data: contentTypes.Skill, aux) => {
    const { formativeCount } = aux;
    return formativeCount < 3;
  },
}, {
  id: Issue.AT_LEAST_3_SUMMATIVE,
  name: 'Skill',
  requirementType: RequirementType.Should,
  requirement: 'have at least 3 summative questions',
  isIssue: (data: contentTypes.Skill, aux) => {
    const { summativeCount } = aux;
    return summativeCount < 3;
  },
}];

export const SKILLS_HELP_LINK = '//olihelp.freshdesk.com/support/solutions/articles/32000023904'
  + '-what-are-learning-objectives-and-skills-';

export const styles: JSSStyles = {
  Skill: {
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
  skillBadge: {
    marginRight: 8,
    lineHeight: 'inherit',
    border: [1, 'solid', colors.grayLight],
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
};

export interface SkillProps {
  skill: contentTypes.Skill;
  editMode: boolean;
  loading: boolean;
  highlightText?: string;
  isEditing: boolean;
  skillQuestionRefs: QuestionRef[];
  onEditSkill: (skill: contentTypes.Skill) => void;
  onEnterEditMode: () => void;
  onExitEditMode: () => void;
  onRemoveSkill: (skill: contentTypes.Skill) => void;
}

export interface SkillState {

}

/**
 * Skill React Component
 */
@injectSheet(styles)
export class Skill
  extends React.PureComponent<StyledComponentProps<SkillProps>,
  SkillState> {

  constructor(props) {
    super(props);
  }

  renderSkillActions(skill: contentTypes.Skill) {
    const { classes, editMode, loading, onEnterEditMode, onRemoveSkill } = this.props;

    return (
      <React.Fragment>
        <Button
          className={classNames([classes.skillActionButton])}
          editMode={editMode && !loading}
          type="link"
          onClick={() => onEnterEditMode()}>
          Rename
        </Button>
        <Button
          className={classNames([classes.skillActionButton, 'btn-remove'])}
          editMode={editMode && !loading}
          type="link"
          onClick={() => onRemoveSkill(skill)}>
          Remove
        </Button>
      </React.Fragment>
    );
  }

  renderSkillBadges(skill: contentTypes.Skill) {
    const { classes, skillQuestionRefs } = this.props;

    const formativeCount = skillQuestionRefs
      .filter(ref => ref.assessmentType === LegacyTypes.inline)
      .reduce((map, ref) => map.set(ref.id, ref), Map<string, QuestionRef>())
      .size;

    const summativeCount = skillQuestionRefs
      .filter(r => r.assessmentType === LegacyTypes.assessment2)
      .length;

    const guaranteedSummativeCount = calculateGuaranteedSummativeCount(
      skillQuestionRefs, summativeCount);

    const formativeTooltip = <div style={{ textAlign: 'left' }}>
      <b><i className="fa fa-flask" /> Formative Question Coverage</b>
      <br />
      This is the number of low stakes, practice questions that are associated with this skill.
    </div>;
    const summativeTooltip = <div style={{ textAlign: 'left' }}>
      <b><i className="fa fa-check" /> Summative Question Coverage</b>
      <br />
      This is the number of high stakes, graded questions that are associated with this skill.
      <br />
      <br />
      This includes the number of pool questions associated with this skill that a student is
      guaranteed to receive.
    </div>;

    const checkModelResults = checkModel(
      skill, skillModelRules, { formativeCount, summativeCount: guaranteedSummativeCount });

    return (
      <div className={classes.skillBadges}>
        {checkModelResults.hasIssue(Issue.AT_LEAST_3_FORMATIVE)
          || checkModelResults.hasIssue(Issue.AT_LEAST_3_SUMMATIVE)
          ? (
            <IssueTooltip
              show={checkModelResults.hasIssue(Issue.AT_LEAST_3_FORMATIVE)
                || checkModelResults.hasIssue(Issue.AT_LEAST_3_SUMMATIVE)}>
              Skills should {checkModelResults.getIssue(Issue.AT_LEAST_3_FORMATIVE).caseOf({
                just: issue => issue.rule.requirement,
                nothing: () => null,
              })}
              {checkModelResults.hasIssue(Issue.AT_LEAST_3_FORMATIVE)
                && checkModelResults.hasIssue(Issue.AT_LEAST_3_SUMMATIVE) && ' and '}
              {checkModelResults.getIssue(Issue.AT_LEAST_3_SUMMATIVE).caseOf({
                just: issue => issue.rule.requirement,
                nothing: () => null,
              })}
              <br />
              <a href={SKILLS_HELP_LINK}
                target="_blank">Learn more about skills</a>.
              </IssueTooltip>
          )
          : undefined
        }
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
              'fa fa-flask', classes.skillCountBadgeIcon])} />
          </span>
        </Tooltip>
        <Tooltip html={summativeTooltip} distance={10}
          size="small" arrowSize="small">
          <span
            className={classNames(['badge badge-light', classes.skillBadge])}
            style={{
              color: flatui.amethyst,
              marginLeft: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            {guaranteedSummativeCount} <i className={classNames([
              'fa fa-check', classes.skillCountBadgeIcon])} />
          </span>
        </Tooltip>
      </div>
    );
  }

  render() {
    const {
      className, classes, skill, editMode, loading, highlightText, isEditing, onEditSkill,
      onExitEditMode,
    } = this.props;

    return (
      <div className={classNames(['Skill', classes.Skill, className])}>
        {this.renderSkillBadges(skill)}
        <div className={classes.skillTitle}>
          <InlineEdit
            inputStyle={{ width: '80%', height: 24 }}
            highlightText={highlightText}
            isEditing={isEditing}
            onEdit={(value) => {
              onEditSkill(skill.with({ title: value }));
              onExitEditMode();
            }}
            onCancel={() => onExitEditMode()}
            editMode={editMode && !loading}
            value={skill.title} />
        </div>
        {!isEditing &&
          <div className={classes.skillActions}>
            {this.renderSkillActions(skill)}
          </div>
        }
      </div>
    );
  }
}


