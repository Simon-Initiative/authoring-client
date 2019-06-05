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
  stat: {
    display: 'inline-block',
    margin: [0, 4],
    minWidth: 60,

    '& i': {
      marginRight: 4,
    },
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

export interface PartAnalyticsProps {
  className?: string;
  partAnalytics: {
    practice: string;
    avgHelpNeeded: string;
    completionRate: number;
    accuracyRate: number;
  };
}

const renderEventuallyCorrectIcon = (completionRate: number) => {
  return completionRate > .80
    ? (
      <i className="fas fa-check-circle" style={{ color: flatui.nephritis }} />
    )
    : (
      <i className="fa fa-times-circle" style={{ color: flatui.pomegranite }} />
    );
};

const renderAccuracyRateBar = (classes, accuracyRate: number) => {
  const rate = Math.min(Math.max(0, accuracyRate), 1);

  // generate a background color on a scale of [red -> orange -> yellow -> green]
  const hue = rate * 145;
  const sat = (-1.1 * (rate * rate)) + (0.9 * rate) + .63;
  const backgroundColor = chroma.hsl(hue, sat, .5).hex();

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

/**
 * PartAnalytics React Stateless Component
 */
export const PartAnalytics = withStyles<PartAnalyticsProps>(styles)(({
  className, classes, partAnalytics,
}) => {
  return (
    <div className={classNames(['PartAnalytics', classes.PartAnalytics, className])}>
      <Tooltip
        html={(
          <div className={classes.analyticsTooltipContent}>
            <div>
              <b>Number of attempts:</b>
              <div className={classNames([classes.stat, classes.practice])}>
                <i className="fa fa-users" />
                {partAnalytics.practice}
              </div>
            </div>
            <div>
              The number of times a student submitted an answer
              for this question.
            </div>
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
            <div>
              <b>Relative difficulty:</b>
              <div className={classNames([classes.stat, classes.avgHelpNeeded])}>
                <i className="fa fa-life-ring" />
                {Number.parseFloat(partAnalytics.avgHelpNeeded).toFixed(2)}
              </div>
            </div>
            <div>
              The ratio of times a student either requested a hint or gave an incorrect answer
              to the total number of question interactions.
              A higher number indicates a lower proportion of correct answers,
              and a more difficult question.
            </div>
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
            <div>
              <b>Eventually correct:</b>
              <div className={classNames([classes.stat, classes.eventuallyCorrect])}>
                {renderEventuallyCorrectIcon(partAnalytics.completionRate)}
                {convert.toPercentage(partAnalytics.completionRate)}
              </div>
            </div>
            <div>
              The percentage of students who eventually answered
              this question correctly.
            </div>
          </div>
        )}
        theme="light"
        delay={250}
        size="small"
        arrowSize="small">
        <div className={classNames([classes.stat, classes.eventuallyCorrect])}>
          {renderEventuallyCorrectIcon(partAnalytics.completionRate)}
          {convert.toPercentage(partAnalytics.completionRate)}
        </div>
      </Tooltip>

      <Tooltip
        html={(
          <div className={classes.analyticsTooltipContent}>
            <div>
              <b>First try correct:</b>
              {renderAccuracyRateBar(classes, partAnalytics.accuracyRate)}
            </div>
            <div>
              The percentage of students who answered this question
              correctly on the first attempt.
            </div>
          </div>
        )}
        theme="light"
        delay={250}
        size="small"
        arrowSize="small">
        {renderAccuracyRateBar(classes, partAnalytics.accuracyRate)}
      </Tooltip>
    </div>
  );
});
