import * as React from 'react';
import { JSSStyles, withStyles, classNames } from 'styles/jss';
import { Tooltip } from 'utils/tooltip';
import { convert } from 'utils/format';
import flatui from 'styles/palettes/flatui';
import * as chroma from 'chroma-js';
import colors from 'styles/colors';

const styles: JSSStyles = {
  PartAnalytics: {
    display: 'flex',
    flexDirection: 'row',
  },
  expandedView: {
    display: 'flex',
    flexDirection: 'column',
    background: colors.white,
    border: [1, 'solid', colors.grayLight],
  },
  expandedStat: {
    padding: 10,
    borderBottom: [1, 'solid', colors.grayLight],

    '&:last-child': {
      borderBottom: 'none',
    },
  },
  stat: {
    display: 'inline-block',
    margin: [0, 10],
    minWidth: 60,

    '& i': {
      marginRight: 4,
    },
  },
  statDescription: {
    fontSize: 12,

  },
  firstTryCorrect: {
    border: [1, 'solid', colors.grayDark],
    fontSize: 10,
    margin: [3, 8],
    verticalAlign: 'top',
    width: 60,
    textAlign: 'center',
    fontWeight: 700,
  },
  eventuallyCorrect: {
    '& i': {
      color: flatui.pomegranite,
    },
  },
  practice: {
    '& i': {
      color: flatui.wetAsphalt,
    },
  },
  avgHelpNeeded: {
    '& i': {
      color: flatui.wetAsphalt,
    },
  },
  accuracyRate: {
    '& i': {
      color: flatui.nephritis,
    },
  },
  analyticsTooltipContent: {
    textAlign: 'start',
  },
};

export const calculateAccuracyRateColor = (accuracyRate: number) => {
  const rate = Math.min(Math.max(0, accuracyRate), 1);

  // generate a background color on a scale of [red -> orange -> yellow -> green]
  const hue = rate * 145;
  const sat = (-1.1 * (rate * rate)) + (0.9 * rate) + .63;

  return chroma.hsl(hue, sat, .5).hex();
};

export interface PartAnalyticsProps {
  className?: string;
  partAnalytics: {
    practice: string;
    avgHelpNeeded: string;
    completionRate: number;
    accuracyRate: number;
  };
  expandedView?: boolean;
}

/**
 * PartAnalytics React Stateless Component
 */
export const PartAnalytics = withStyles<PartAnalyticsProps>(styles)(({
  className, classes, partAnalytics, expandedView,
}) => {

  const renderAccuracyRateBar = (accuracyRate: number) => {
    const backgroundColor = calculateAccuracyRateColor(accuracyRate);

    // minimum contrast ratio for text visibility is 4.5
    const color = chroma.contrast(backgroundColor, colors.black) > 4.5
      ? colors.black : colors.white;
    const borderColor = chroma(backgroundColor).darken(0.5).hex();

    return (
      <div className={classNames([classes.stat, classes.firstTryCorrect])}
        style={{ backgroundColor, color, borderColor }}>
        {convert.toPercentage(accuracyRate)}
      </div>
    );
  };

  const renderNumberOfAttempts = (practice: string) => (
    <React.Fragment>
      <div>
        <b>Number of Attempts</b>
        <div className={classNames([classes.stat, classes.practice])}>
          <i className="fa fa-users" />
          {practice}
        </div>
      </div>
      <div className={classes.statDescription}>
        The number of student responses submitted.
      </div>
    </React.Fragment>
  );

  const renderRelativeDifficulty = (avgHelpNeeded: string) => (
    <React.Fragment>
      <div>
        <b>Relative Difficulty</b>
        <div className={classNames([classes.stat, classes.avgHelpNeeded])}>
          <i className="fa fa-life-ring" />
          {Number.parseFloat(avgHelpNeeded).toFixed(2)}
        </div>
      </div>
      <div className={classes.statDescription}>
        The ratio of times a student either requested a hint or gave an incorrect answer
        to the total number of interactions.
        A higher ratio indicates greater difficulty.
      </div>
    </React.Fragment>
  );

  const getEventuallyCorrectIcon = (completionRate: number) => {
    return completionRate > .80
      ? (
        <i className="fas fa-check-circle" style={{ color: flatui.nephritis }} />
      )
      : (
        <i className="fa fa-times-circle" style={{ color: flatui.pomegranite }} />
      );
  };

  const renderEventuallyCorrect = (completionRate: number) => (
    <React.Fragment>
      <div>
        <b>Eventually Correct</b>
        <div className={classNames([classes.stat, classes.eventuallyCorrect])}>
          {getEventuallyCorrectIcon(completionRate)}
          {convert.toPercentage(completionRate)}
        </div>
      </div>
      <div className={classes.statDescription}>
        The percentage of students who eventually submitted a correct response.
      </div>
    </React.Fragment>
  );

  const renderAccuracyRate = (accuracyRate: number) => (
    <React.Fragment>
      <div>
        <b>First Try Correct</b>
        {renderAccuracyRateBar(accuracyRate)}
      </div>
      <div className={classes.statDescription}>
        The percentage of students who submitted a correct response on the first attempt.
      </div>
    </React.Fragment>
  );

  return expandedView
    ? (
      <div className={classNames([
        'PartAnalytics',
        classes.PartAnalytics,
        classes.expandedView,
        className,
      ])}>
        <div className={classes.expandedStat}>
          {renderAccuracyRate(partAnalytics.accuracyRate)}
        </div>
        <div className={classes.expandedStat}>
          {renderEventuallyCorrect(partAnalytics.completionRate)}
        </div>
        <div className={classes.expandedStat}>
          {renderRelativeDifficulty(partAnalytics.avgHelpNeeded)}
        </div>
        <div className={classes.expandedStat}>
          {renderNumberOfAttempts(partAnalytics.practice)}
        </div>
      </div>
    )
    : (
      <div className={classNames(['PartAnalytics', classes.PartAnalytics, className])}>
        <Tooltip
          html={(
            <div className={classes.analyticsTooltipContent}>
              {renderNumberOfAttempts(partAnalytics.practice)}
            </div>
          )}
          theme="light"
          delay={250}
          size="small"
          arrowSize="small">
          <div className={classNames([classes.stat, classes.practice])}>
            <i className="fa fa-users" />
            {partAnalytics.practice}
          </div>
        </Tooltip>

        <Tooltip
          html={(
            <div className={classNames([classes.stat, classes.analyticsTooltipContent])}>
              {renderRelativeDifficulty(partAnalytics.avgHelpNeeded)}
            </div>
          )}
          theme="light"
          delay={250}
          size="small"
          arrowSize="small">
          <div className={classNames([classes.stat, classes.avgHelpNeeded])}>
            <i className="fa fa-life-ring" />
            {Number.parseFloat(partAnalytics.avgHelpNeeded).toFixed(2)}
          </div>
        </Tooltip>

        <Tooltip
          html={(
            <div className={classes.analyticsTooltipContent}>
              {renderEventuallyCorrect(partAnalytics.completionRate)}
            </div>
          )}
          theme="light"
          delay={250}
          size="small"
          arrowSize="small">
          <div className={classNames([classes.stat, classes.eventuallyCorrect])}>
            {getEventuallyCorrectIcon(partAnalytics.completionRate)}
            {convert.toPercentage(partAnalytics.completionRate)}
          </div>
        </Tooltip>

        <Tooltip
          html={(
            <div className={classes.analyticsTooltipContent}>
              {renderAccuracyRate(partAnalytics.accuracyRate)}
            </div>
          )}
          theme="light"
          delay={250}
          size="small"
          arrowSize="small">
          {renderAccuracyRateBar(partAnalytics.accuracyRate)}
        </Tooltip>
      </div>
    );
});
