import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { styles } from './GlobalError.styles';
import { buildFeedbackFromCurrent } from 'utils/feedback';

export interface GlobalErrorProps {
  error: any;
  info: any;
  userName: string;
  email: string;
}

const GlobalError:
React.StatelessComponent<StyledComponentProps<GlobalErrorProps, typeof styles>> = ({
  classes, userName, email,
}) => {

  const reportError = () => {
    const url = buildFeedbackFromCurrent(userName, email);
    window.open(url, 'error');
  };

  return (
    <div className={classNames([classes.globalError])}>

      <div className={classNames([classes.globalContent])}>

        <div>
          <span>
            <i className="far fa-frown fa-4x"></i>
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

};

const StyledGlobalError = withStyles<GlobalErrorProps>(styles)(GlobalError);
export { StyledGlobalError as GlobalError };
