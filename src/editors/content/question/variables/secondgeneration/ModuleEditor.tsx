import * as React from 'react';
import * as Immutable from 'immutable';
import { Evaluation, evaluate } from 'data/persistence/variables';
import { AbstractContentEditorProps, AbstractContentEditor }
  from 'editors/content/common/AbstractContentEditor';
import { Variables } from 'data/content/assessment/variable';
import { SourcePanel } from 'editors/content/question/variables/secondgeneration/SourcePanel';
import { ResultsPanel } from 'editors/content/question/variables/secondgeneration/ResultsPanel';
import { Tooltip } from 'utils/tooltip';
import { Maybe } from 'tsmonad';
import { TestResults } from 'editors/content/question/variables/secondgeneration/TestResults';

import './ModuleEditor.scss';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

const NUMBER_OF_ATTEMPTS = 10;

export interface ModuleEditorProps extends AbstractContentEditorProps<Variables> {

}

export interface ModuleEditorState {
  results: Immutable.Map<string, Evaluation>;
  errorCount: number;
  testing: boolean;
  testingCompleted: boolean;
}

export class ModuleEditor extends AbstractContentEditor<Variables,
  ModuleEditorProps, ModuleEditorState> {

  constructor(props) {
    super(props);

    this.onEvaluateVariables = this.onEvaluateVariables.bind(this);
    this.onExpressionEdit = this.onExpressionEdit.bind(this);
    this.onTestMultipleTimes = this.onTestMultipleTimes.bind(this);
    this.onSetActiveContent = this.onSetActiveContent.bind(this);

    this.state = {
      results: Immutable.Map<string, Evaluation>(),
      errorCount: undefined,
      testing: false,
      testingCompleted: false,
    };
  }

  componentDidMount() {
    this.onEvaluateVariables();
  }

  shouldComponentUpdate() {
    return true;
  }

  onExpressionEdit(expression: string) {
    const { onEdit, model } = this.props;

    const variable = model.first();

    onEdit(
      model.set(variable.guid, variable.with({ expression })),
      null);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  onSetActiveContent() {

  }

  onEvaluateVariables() {

    const { model } = this.props;
    // Clear the current results and re-evaluate
    this.setState(
      { results: Immutable.Map<string, Evaluation>() },
      () => evaluate(model).then((results) => {
        this.setState({
          results: Immutable.Map<string, Evaluation>(results.first().map(r => [r.variable, r])),
        });
      }));
  }

  // Return the error count. `evaluate` returns a list of evaluations,
  // one for each attempt. We iterate through each attempt to see if
  // any of the variables in that evaluation failed. If so, we consider
  // the whole attempt as a failure and increment the error count.
  onTestMultipleTimes(attempts = NUMBER_OF_ATTEMPTS): Promise<number> {

    // We count as variable evaluation as 'errored' if the evaluator throws an error,
    // or if the variable evaluates to null or undefined (which occurs from array indexing
    // or by other logic errors)
    const hasError = (hasError, evaluation: Evaluation): boolean =>
      hasError ||
      evaluation.errored ||
      evaluation.result === null ||
      evaluation.result === undefined;

    const attemptHasError = (evaluations: Evaluation[]): boolean =>
      evaluations.reduce(hasError, false);

    const countAttemptErrors = (results: Immutable.List<Evaluation[]>): number =>
      results.reduce(
        (errorCount, evaluations) =>
          attemptHasError(evaluations)
            ? errorCount + 1
            : errorCount,
        0);

    return this.runTests(attempts).then(results =>
      countAttemptErrors(results));
  }

  runTests(attempts = NUMBER_OF_ATTEMPTS): Promise<Immutable.List<Evaluation[]>> {
    const { model } = this.props;

    return evaluate(model, attempts);
  }


  renderBottomPanel() {
    const { editMode } = this.props;
    const { errorCount } = this.state;

    const wrap = key => <span className="key-wrapper">{key}</span>;

    const runHotkeys = <React.Fragment>
      {wrap('⌘')} {wrap('Enter')} / {wrap('Ctrl')} {wrap('Enter')}
    </React.Fragment>;

    const runButton = <Tooltip html={runHotkeys} delay={100} distance={5}
      position="top" style={{ display: 'inline-block' }} size="small" arrowSize="small">
      <button className="btn btn-sm btn-link module-button run-button" type="button"
        disabled={!editMode}
        onClick={() => this.onEvaluateVariables()}>
        <i className="fa fa-play"></i> Run
      </button>
    </Tooltip>;

    const testHotkeys = <React.Fragment>
      {wrap('⌘')} {wrap('Shift')} {wrap('Enter')} / {wrap('Ctrl')} {wrap('Shift')} {wrap('Enter')}
    </React.Fragment>;

    const testButton = <Tooltip html={testHotkeys} delay={100} distance={5}
      position="top" style={{ display: 'inline-block' }} size="small" arrowSize="small">
      <button className="btn btn-sm btn-link module-button test-button" type="button"
        disabled={!editMode}
        onClick={() => {
          this.setState({ testing: true, testingCompleted: false, errorCount: undefined });
          this.onTestMultipleTimes()
            .then(errorCount => this.setState({
              errorCount, testing: false, testingCompleted: true,
            }))
            .catch(_ => this.setState({ testing: false, testingCompleted: true }));
        }}>
        Test 10x
      </button>
    </Tooltip>;

    const testResults =
      this.state.testing
        ? <span className="vertical-center">
          <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" /> Testing...
        </span>
        : this.state.testingCompleted
          ? this.state.errorCount === undefined
            ? <span className="vertical-center">
              <i className="fa fa-ban fa-2x" style={{ color: '#f39c12' }}></i> Try again
            </span>
            : <TestResults percentTestsPassed={!isNaN(errorCount)
              ? (NUMBER_OF_ATTEMPTS - errorCount) / NUMBER_OF_ATTEMPTS
              : errorCount} />
          : null;

    return (
      <div className="button-panel">
        {runButton}
        {testButton}
        {testResults}
      </div>
    );
  }

  renderMain() {
    const { model } = this.props;

    const variable = model.first();

    return (
      <div className="moduleEditor"
        onClick={() => this.props.onFocus(model, this.props.parent, Maybe.nothing())}>
        {variable &&
          <div className="splitPane">
            <SourcePanel
              {...this.props}
              model={variable}
              onExpressionEdit={this.onExpressionEdit}
              evaluateVariables={this.onEvaluateVariables}
              testMultipleTimes={this.onTestMultipleTimes} />
            <ResultsPanel
              evalResults={this.state.results} />
          </div>
        }
        {this.renderBottomPanel()}
      </div>
    );
  }
}
