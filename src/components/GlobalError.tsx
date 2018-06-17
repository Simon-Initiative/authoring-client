import * as React from 'react';
import { injectSheetSFC, classNames } from 'styles/jss';
import { styles } from './GlobalError.styles';
import { buildFeedbackFromCurrent } from 'utils/feedback';

export interface GlobalErrorProps {
  error: any;
  info: any;
  userName: string;
  email: string;
}

export const GlobalError = injectSheetSFC<GlobalErrorProps>(styles)(({
  classes, error, info, userName, email,
}) => {

  const reportError = () => {
    const url = buildFeedbackFromCurrent(userName, email);
    window.open(url, 'error');
  };

  return (
    <div className={classNames([classes.globalError])}>

      <div className={classNames([classes.globalContent])}>

        <div className={classNames([classes.icon])}>
          <span>
            <i className="fa fa-frown-o fa-4x"></i>
          </span>
        </div>

        <p>
          Oh no! Something went wrong.
        </p>

        <p>
          Refreshing your browser and trying again may
          fix the problem.
        </p>

        <button
          onClick={reportError}
          className="btn btn-primary">
          Report this problem
        </button>

      </div>

    </div>
  );

});
