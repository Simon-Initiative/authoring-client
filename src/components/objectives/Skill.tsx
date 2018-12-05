import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import flatui from 'styles/palettes/flatui';
import * as contentTypes from '../../data/contentTypes';
import { InlineEdit } from './InlineEdit';
import { Button } from 'components/common/Button';
import { IssueTooltip } from 'components/objectives/IssueTooltip';
import { Tooltip } from 'utils/tooltip';
import { addPluralS, QuestionRef } from 'components/objectives/utils';
import {
  FORMATIVE_COUNT_WARNING_THRESHOLD, SUMMATIVE_COUNT_WARNING_THRESHOLD, SKILLS_HELP_LINK,
} from 'components/objectives/config';
import { LegacyTypes } from 'data/types';

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
      .filter(r => r.assessmentType === LegacyTypes.inline)
      .length;

    const summativeCount = skillQuestionRefs
    .filter(r => r.assessmentType === LegacyTypes.assessment2)
    .length;

    const poolCount = skillQuestionRefs
    .filter(r => r.assessmentType === LegacyTypes.assessment2_pool)
    .length;

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
          <IssueTooltip
            show={!!(notEnoughFormativesWarning || notEnoughSummativesWarning)}>
            <div>
              Skills should have {notEnoughFormativesWarning}
              {notEnoughFormativesWarning && notEnoughSummativesWarning && ' and '}
              {notEnoughSummativesWarning} {addPluralS('question', Math.max(
                FORMATIVE_COUNT_WARNING_THRESHOLD,
                SUMMATIVE_COUNT_WARNING_THRESHOLD,
              ))}
              <br/>
              <a href={SKILLS_HELP_LINK}
                target="_blank">Learn more about skills</a>.
            </div>
          </IssueTooltip>
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


