import * as React from 'react';
import * as Immutable from 'immutable';
import { Evaluation, evaluate } from 'data/persistence/variables';
import { AbstractContentEditorProps, AbstractContentEditor }
  from 'editors/content/common/AbstractContentEditor';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import { Variables } from 'data/content/assessment/variable';
import { SourcePanel } from 'editors/content/question/variables/secondgeneration/SourcePanel';
import { ResultsPanel } from 'editors/content/question/variables/secondgeneration/ResultsPanel';

import './ModuleEditor.scss';

import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

export interface ModuleEditorProps extends AbstractContentEditorProps<Variables> {

}

export interface ModuleEditorState {
  results: Immutable.Map<string, Evaluation>;
}

export class ModuleEditor extends AbstractContentEditor<Variables,
  ModuleEditorProps, ModuleEditorState> {

  constructor(props) {
    super(props);

    this.onEvaluateVariables = this.onEvaluateVariables.bind(this);
    this.onExpressionEdit = this.onExpressionEdit.bind(this);

    this.state = {
      results: Immutable.Map<string, Evaluation>(),
    };
  }

  shouldComponentUpdate(nextProps: ModuleEditorProps, nextState: ModuleEditorState) {
    return true;
    // return super.shouldComponentUpdate(nextProps, nextState)
    //   || this.state.results !== nextState.results;
  }

  componentDidMount() {
    this.onEvaluateVariables();
  }

  // evaluateVariables() {
    // const { model } = this.props;
    // if (model.size > 0) {
      // this.evaluateVariables();
    // }
  // }

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

  onEvaluateVariables() {

    const { model } = this.props;
    // Clear the current results and re-evaluate
    this.setState(
      { results: Immutable.Map<string, Evaluation>() },
      () => evaluate(model).then((results) => {
        console.log('results', results);
        this.setState({
          results: Immutable.Map<string, Evaluation>(results.first().map(r => [r.variable, r])),
        });
      }));
  }

  testMultipleTimes(attempts = 1000): Promise<Immutable.List<Evaluation[]>> {
    const { model } = this.props;

    return evaluate(model, attempts);
  }

  // Return the error count. `evaluate` returns a list of evaluations,
  // one for each attempt. We iterate through each attempt to see if
  // any of the variables in that evaluation failed. If so, we consider
  // the whole attempt as a failure and increment the error count.
  determineErrorCount(attempts = 1000): Promise<number> {

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

    return this.testMultipleTimes(attempts).then(results => countAttemptErrors(results));
  }

  renderButtonPanel() {
    const { editMode } = this.props;

    const testButton = <button className="btn btn-sm btn-link" type="button"
      disabled={!editMode}
      onClick={() => this.onEvaluateVariables()}>
      Run
    </button>;

    return (
      <div className="buttonPanel">
        {/* {createOrRemove} */}
        {/* {openButton} */}
        {testButton}
      </div>
    );
  }

  renderMain() {
    const { model } = this.props;

    const variable = model.first();

    return (
      <div className="ModuleEditor">
        {variable &&
          <div className="splitPane">
            <SourcePanel
              {...this.props}
              model={variable}
              onExpressionEdit={this.onExpressionEdit}
              evaluateVariables={this.onEvaluateVariables} />
            <ResultsPanel
              results={this.state.results} />
          </div>
        }
        {this.renderButtonPanel()}
      </div>
    );
  }
}
